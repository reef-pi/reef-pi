package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/camera"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

const Bucket = "reef-pi"

type Subsystem interface {
	Setup() error
	LoadAPI(*mux.Router)
	Start()
	Stop()
}

type ReefPi struct {
	store      utils.Store
	jacks      *connectors.Jacks
	outlets    *connectors.Outlets
	subsystems map[string]Subsystem
	settings   Settings
	telemetry  *utils.Telemetry
}

func New(database string) (*ReefPi, error) {
	store, err := utils.NewStore(database)
	if err != nil {
		log.Println("ERROR: Failed to create store. DB:", database)
		return nil, err
	}
	s, err := loadSettings(store)
	if err != nil {
		log.Println("Warning: Failed to load settings from db, Error:", err)
		log.Println("Warning: Initializing default settings in database")
		s = DefaultSettings
		if err := initializeSettings(store); err != nil {
			return nil, err
		}
	}
	telemetry := utils.NewTelemetry(s.AdafruitIO)
	jacks := connectors.NewJacks(store)
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = s.DevMode
	r := &ReefPi{
		store:      store,
		settings:   s,
		telemetry:  telemetry,
		jacks:      jacks,
		outlets:    outlets,
		subsystems: make(map[string]Subsystem),
	}
	return r, nil
}

func (r *ReefPi) loadSubsystems() error {
	if r.settings.System {
		conf := system.Config{
			Interface: r.settings.Interface,
			Name:      r.settings.Name,
			Display:   r.settings.Display,
			DevMode:   r.settings.DevMode,
		}
		r.subsystems[system.Bucket] = system.New(conf, r.store, r.telemetry)
	}
	eqs := new(equipments.Controller)
	if r.settings.Equipments {
		conf := equipments.Config{
			DevMode: r.settings.DevMode,
		}
		eqs = equipments.New(conf, r.outlets, r.store, r.telemetry)
		r.subsystems[equipments.Bucket] = eqs
	}

	if r.settings.Temperature {
		conf := temperature.Config{}
		temp, err := temperature.New(conf, r.store, r.telemetry)
		if err != nil {
			log.Println("Failed to initialize temperature controller")
			return err
		}
		r.subsystems[temperature.Bucket] = temp
	}
	if r.settings.ATO {
		conf := ato.Config{}
		a, err := ato.New(conf, r.store, r.telemetry)
		if err != nil {
			log.Println("Failed to initialize ato controller")
			return err
		}
		r.subsystems[ato.Bucket] = a
	}
	if r.settings.Lighting {
		conf := lighting.Config{
			DevMode:  r.settings.DevMode,
			Interval: r.settings.LightInterval,
		}
		l, err := lighting.New(conf, r.jacks, r.store, r.telemetry)
		if err != nil {
			return err
		}
		r.subsystems[lighting.Bucket] = l
	}

	if r.settings.Timers {
		r.subsystems[timer.Bucket] = timer.New(r.store, r.telemetry, eqs)
	}
	if r.settings.Camera {
		conf := camera.Config{}
		r.subsystems[camera.Bucket] = camera.New(conf)
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
	if err := r.jacks.Setup(); err != nil {
		return err
	}
	if err := r.outlets.Setup(); err != nil {
		return err
	}
	if err := r.loadSubsystems(); err != nil {
		return err
	}
	r.setupAPI()
	log.Println("reef-pi is up and running")
	return nil
}

func (r *ReefPi) unloadSubsystems() {
	for sName, sController := range r.subsystems {
		sController.Stop()
		delete(r.subsystems, sName)
		log.Println("Successfully unloaded", sName, " subsystem:")
	}
}

func (r *ReefPi) Stop() error {
	r.unloadSubsystems()
	r.store.Close()
	log.Println("reef-pi is shutting down")
	return nil
}
