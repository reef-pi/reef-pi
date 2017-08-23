package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/camera"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type Subsystem interface {
	Setup() error
	LoadAPI(*mux.Router)
	Start()
	Stop()
}

type ReefPi struct {
	store      utils.Store
	subsystems map[string]Subsystem
	config     Config
	telemetry  *utils.Telemetry
}

func New(config Config) (*ReefPi, error) {
	store, err := utils.NewStore(config.Database)
	if err != nil {
		log.Println("Failed to create store. DB:", config.Database)
		return nil, err
	}
	telemetry := utils.NewTelemetry(config.AdafruitIO)
	r := &ReefPi{
		store:      store,
		config:     config,
		telemetry:  telemetry,
		subsystems: make(map[string]Subsystem),
	}
	return r, nil
}

func (r *ReefPi) loadSubsystems() error {
	if r.config.System.Enable {
		r.subsystems[system.Bucket] = system.New(r.config.System, r.store, r.telemetry)
	}
	eqs := new(equipments.Controller)
	if r.config.Equipments.Enable {
		eqs = equipments.New(r.config.Equipments, r.store, r.telemetry)
		r.subsystems[equipments.Bucket] = eqs
	}
	if r.config.Temperature.Enable {
		temp, err := temperature.New(r.config.Temperature, r.store, r.telemetry)
		if err != nil {
			log.Println("Failed to initialize temperature controller")
			return err
		}
		r.subsystems[temperature.Bucket] = temp
	}
	if r.config.ATO.Enable {
		a, err := ato.New(r.config.ATO, r.store, r.telemetry)
		if err != nil {
			log.Println("Failed to initialize ato controller")
			return err
		}
		r.subsystems[ato.Bucket] = a
	}
	if r.config.Lighting.Enable {
		r.subsystems[lighting.Bucket] = lighting.New(r.config.Lighting, r.store, r.telemetry)
	}
	if r.config.Timers.Enable {
		r.subsystems[timer.Bucket] = timer.New(r.config.Timers, r.store, r.telemetry, eqs)
	}
	if r.config.Camera.Enable {
		r.subsystems[camera.Bucket] = camera.New(r.config.Camera)
	}
	for sName, sController := range r.subsystems {
		if err := sController.Setup(); err != nil {
			log.Println("Failed to setup subsystem:", sName)
			return err
		}
		sController.Start()
		log.Println("Successfully started subsystem:", sName)
	}
	return nil
}

func (r *ReefPi) Start() error {
	if err := r.loadSubsystems(); err != nil {
		return err
	}
	r.setupAPI()
	log.Println("reef-pi is up and running")
	return nil
}

func (r *ReefPi) shutDownSubsystems() {
	for sName, sController := range r.subsystems {
		sController.Stop()
		log.Println("Successfully stopped", sName, " subsystem:")
	}
}

func (r *ReefPi) Stop() error {
	r.shutDownSubsystems()
	r.store.Close()
	log.Println("reef-pi is shutting down")
	return nil
}
