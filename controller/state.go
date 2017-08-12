package controller

import (
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type State struct {
	lighting    *lighting.Controller
	temperature *temperature.Controller
	system      *system.Controller
	ato         *ato.Controller
	telemetry   *utils.Telemetry
	equipments  *equipments.Controller
	config      Config
	store       utils.Store
}

func NewState(c Config, store utils.Store, telemetry *utils.Telemetry) *State {
	s := &State{
		config:    c,
		store:     store,
		telemetry: telemetry,
	}
	if c.Equipments.Enable {
		s.equipments = equipments.New(store, c.Equipments, telemetry)
	}
	return s
}

func (s *State) Bootup() error {
	if s.config.Equipments.Enable {
		log.Println("Enabled GPIO subsystem")
		s.equipments.Start()
	}
	if s.config.Temperature.Enable {
		t, err := temperature.NewController(s.config.Temperature, s.telemetry)
		if err != nil {
			log.Println("Failed to initialize temperature controller")
			return err
		}
		s.temperature = t
		go s.temperature.Start()
		log.Println("Temperature controller started")
	}
	if s.config.ATO.Enable {
		a, err := ato.NewController(s.config.ATO, s.telemetry)
		if err != nil {
			log.Println("Failed to initialize ato controller")
			return err
		}
		s.ato = a
		go s.ato.Start()
		log.Println("ATO controller started")
	}
	if s.config.Lighting.Enable {
		s.lighting = lighting.New(s.config.Lighting, s.store, s.telemetry)
		s.lighting.Reconfigure()
		log.Println("Successfully initialized lighting subsystem")
	}
	return nil
}

func (s *State) TearDown() {
	if s.config.Lighting.Enable {
		s.lighting.Stop()
	}
	if s.config.DevMode {
		log.Println("Running is dev mode, skipping driver teardown")
		return
	}
	if s.config.Temperature.Enable {
		s.temperature.Stop()
		log.Println("Temperature controller stopped")
	}
	if s.config.ATO.Enable {
		s.ato.Stop()
		log.Println("ATO controller stopped")
	}
}
