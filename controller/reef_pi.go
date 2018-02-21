package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
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
	bus        i2c.Bus
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
		initialSettings, err := initializeSettings(store)
		if err != nil {
			return nil, err
		}
		s = initialSettings
	}

	telemetry := initializeTelemetry(store, s.Notification)
	jacks := connectors.NewJacks(store)
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = s.Capabilities.DevMode
	r := &ReefPi{
		bus:        i2c.MockBus(),
		store:      store,
		settings:   s,
		telemetry:  telemetry,
		jacks:      jacks,
		outlets:    outlets,
		subsystems: make(map[string]Subsystem),
		version:    version,
	}
	if !s.Capabilities.DevMode {
		b, err := i2c.New()
		if err != nil {
			log.Println("ERROR: Failed to creates i2c bus. Error:", err)
		} else {
			r.bus = b
		}
	}
	if s.Capabilities.HealthCheck {
		r.h = NewHealthChecker(1*time.Minute, s.HealthCheck, telemetry, store)
	}
	return r, nil
}

func (r *ReefPi) Start() error {
	b, err := i2c.New()
	if err != nil {
		log.Println("ERROR: Failed to initialize i2c. Using mock bus. Error:", err)
	} else {
		r.bus = b
	}
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
