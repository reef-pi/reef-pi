package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/camera"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/doser"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
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
	version    string
	h          *HealthChecker
}

func New(version, database string) (*ReefPi, error) {
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
	var mailer utils.Mailer
	mailer = &utils.NoopMailer{}
	if s.Notification {
		var conf utils.MailerConfig
		if err := store.Get(Bucket, "mailer_config", &conf); err != nil {
			log.Println("ERROR: Failed to load mailer config. Error:", err)
		} else {
			log.Println("Using mailer from saved settings")
			mailer = conf.Mailer()
		}
	}
	telemetry := utils.NewTelemetry(s.AdafruitIO, mailer)
	jacks := connectors.NewJacks(store)
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = s.Capabilities.DevMode
	r := &ReefPi{
		store:      store,
		settings:   s,
		telemetry:  telemetry,
		jacks:      jacks,
		outlets:    outlets,
		subsystems: make(map[string]Subsystem),
		version:    version,
	}
	if s.Capabilities.HealthCheck {
		r.h = NewHealthChecker(1*time.Minute, s.HealthCheck, telemetry)
	}
	return r, nil
}

func (r *ReefPi) loadSubsystems() error {
	if r.settings.Capabilities.Configuration {
		conf := system.Config{
			Interface: r.settings.Interface,
			Name:      r.settings.Name,
			Display:   r.settings.Display,
			DevMode:   r.settings.Capabilities.DevMode,
			Version:   r.version,
		}
		r.subsystems[system.Bucket] = system.New(conf, r.store, r.telemetry)
	}
	eqs := new(equipments.Controller)
	if r.settings.Capabilities.Equipments {
		conf := equipments.Config{
			DevMode: r.settings.Capabilities.DevMode,
		}
		eqs = equipments.New(conf, r.outlets, r.store, r.telemetry)
		r.subsystems[equipments.Bucket] = eqs
	}
	if r.settings.Capabilities.Timers {
		t := timer.New(r.store, r.telemetry, eqs)
		r.subsystems[timer.Bucket] = t
		eqs.AddCheck(t.IsEquipmentInUse)
	}

	if r.settings.Capabilities.Temperature {
		temp, err := temperature.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
		if err != nil {
			log.Println("ERROR: Failed to initialize temperature subsystem")
			return err
		}
		r.subsystems[temperature.Bucket] = temp
		eqs.AddCheck(temp.IsEquipmentInUse)
	}
	if r.settings.Capabilities.ATO {
		a, err := ato.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
		if err != nil {
			log.Println("ERROR: Failed to initialize ato subsystem")
			return err
		}
		r.subsystems[ato.Bucket] = a
		eqs.AddCheck(a.IsEquipmentInUse)
	}
	if r.settings.Capabilities.Lighting {
		conf := lighting.Config{
			DevMode:  r.settings.Capabilities.DevMode,
			Interval: r.settings.LightInterval,
		}
		l, err := lighting.New(conf, r.jacks, r.store, r.telemetry)
		if err != nil {
			log.Println("ERROR: Failed to initialize lighting subsystem")
			return err
		}
		r.subsystems[lighting.Bucket] = l
	}

	if r.settings.Capabilities.Camera {
		cam, err := camera.New(r.store)
		if err != nil {
			return nil
		}
		r.subsystems[camera.Bucket] = cam
	}
	if r.settings.Capabilities.Doser {
		d, err := doser.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
		if err != nil {
			log.Println("ERROR: Failed to initialize doser subsystem")
			return err
		}
		r.subsystems[doser.Bucket] = d
	}
	for sName, sController := range r.subsystems {
		if err := sController.Setup(); err != nil {
			log.Println("ERROR: Failed to setup subsystem:", sName)
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
	if r.settings.Capabilities.HealthCheck {
		go r.h.Start()
	}

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
	if r.settings.Capabilities.HealthCheck {
		r.h.Stop()
	}
	r.store.Close()
	log.Println("reef-pi is shutting down")
	return nil
}
