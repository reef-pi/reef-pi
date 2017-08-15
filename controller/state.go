package controller

import (
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type State struct {
	lighting    *lighting.Controller
	temperature *temperature.Controller
	system      *system.Controller
	ato         *ato.Controller
	timer       *timer.Controller
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
		s.equipments = equipments.New(c.Equipments, store, telemetry)
	}
	return s
}

func (s *State) Bootup() error {
	if s.config.Equipments.Enable {
		log.Println("Started equipments subsystem")
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
		log.Println("Started temperature subsystem")
	}
	if s.config.ATO.Enable {
		a, err := ato.NewController(s.config.ATO, s.telemetry)
		if err != nil {
			log.Println("Failed to initialize ato controller")
			return err
		}
		s.ato = a
		go s.ato.Start()
		log.Println("Started ATO subsystem")
	}
	if s.config.Lighting.Enable {
		s.lighting = lighting.New(s.config.Lighting, s.store, s.telemetry)
		s.lighting.Start()
		log.Println("Started lighting subsystem")
	}
	if s.config.System.Enable {
		s.system = system.New(s.config.System, s.store, s.telemetry)
		log.Println("Started system subsystem")
	}
	if s.config.Timer.Enable {
		s.timer = timer.New(s.config.Timer, s.store, s.telemetry, s.equipments)
		s.timer.Start()
		log.Println("Started timer subsystem")
	}
	return nil
}

func (s *State) TearDown() {
	log.Println("Teardown triggered")
	if s.config.Lighting.Enable {
		s.lighting.Stop()
	}
	if s.config.Equipments.Enable {
		s.equipments.Stop()
	}
	if s.config.Temperature.Enable {
		s.temperature.Stop()
		log.Println("Temperature controller stopped")
	}
	if s.config.ATO.Enable {
		s.ato.Stop()
		log.Println("ATO controller stopped")
	}
	if s.config.Timer.Enable {
		s.timer.Stop()
		log.Println("ATO controller stopped")
	}
	return
}
