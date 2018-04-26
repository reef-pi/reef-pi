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
	store   utils.Store
	jacks   *connectors.Jacks
	outlets *connectors.Outlets
	inlets  *connectors.Inlets

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

	bus := i2c.Bus(i2c.MockBus())
	if !s.Capabilities.DevMode {
		b, err := i2c.New()
		if err != nil {
			log.Println("ERROR: Failed to initialize i2c. Error:", err)
			return nil, err
		}
		bus = b
	}
	telemetry := initializeTelemetry(store, s.Notification)
	pi := utils.NewRPIPWMDriver()
	pConfig := utils.DefaultPWMConfig
	pConfig.DevMode = true

	pca9685, err := utils.NewPWM(i2c.MockBus(), pConfig)
	if err != nil {
		log.Println("ERROR: Failed to initialize pca9685 driver with mock i2c bus. Error:", err)
		return nil, err
	}
	if s.PCA9685 {
		p, err := utils.NewPWM(bus, pConfig)
		if err != nil {
			log.Println("ERROR: Failed to initialize pca9685 driver")
			return nil, err
		}
		pca9685 = p
	}
	jacks := connectors.NewJacks(store, pi, pca9685)
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = s.Capabilities.DevMode
	inlets := connectors.NewInlets(store)
	inlets.DevMode = s.Capabilities.DevMode
	r := &ReefPi{
		bus:        bus,
		store:      store,
		settings:   s,
		telemetry:  telemetry,
		jacks:      jacks,
		outlets:    outlets,
		inlets:     inlets,
		subsystems: make(map[string]Subsystem),
		version:    version,
	}
	if s.Capabilities.HealthCheck {
		r.h = NewHealthChecker(1*time.Minute, s.HealthCheck, telemetry, store)
	}
	return r, nil
}

func (r *ReefPi) Start() error {
	if err := r.jacks.Setup(); err != nil {
		return err
	}
	if err := r.outlets.Setup(); err != nil {
		return err
	}
	if err := r.inlets.Setup(); err != nil {
		return err
	}
	if err := r.loadSubsystems(); err != nil {
		return err
	}
	if _, err := loadDashboard(r.store); err != nil {
		initializeDashboard(r.store)
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
	r.bus.Close()
	log.Println("reef-pi is shutting down")
	return nil
}
