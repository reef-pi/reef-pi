package daemon

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

const Bucket = storage.ReefPiBucket

type ReefPi struct {
	version    string
	a          utils.Auth
	store      storage.Store
	settings   settings.Settings
	telemetry  telemetry.Telemetry
	h          telemetry.HealthChecker
	dm         *device_manager.DeviceManager
	subsystems map[string]controller.Subsystem
}

func New(version, database string) (*ReefPi, error) {
	store, err := storage.NewStore(database)
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
	fn := func(t, m string) error { return logError(store, t, m) }
	tele := telemetry.Initialize(Bucket, store, fn, s.Prometheus)
	r := &ReefPi{
		store:      store,
		settings:   s,
		telemetry:  tele,
		subsystems: make(map[string]controller.Subsystem),
		version:    version,
		a:          utils.NewAuth(Bucket, store),
		dm:         device_manager.New(s, store),
	}
	if s.Capabilities.HealthCheck {
		r.h = telemetry.NewHealthChecker(Bucket, 1*time.Minute, s.HealthCheck, tele, store)
	}
	return r, nil
}

func (r *ReefPi) Start() error {
	if err := r.setUpErrorBucket(); err != nil {
		return err
	}
	if err := r.dm.Setup(); err != nil {
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
	r.dm.Close()
	log.Println("reef-pi is shutting down")
	r.store.Close()
	return nil
}

func (r *ReefPi) Subsystem(s string) (controller.Subsystem, error) {
	sub, ok := r.subsystems[s]
	if !ok {
		return nil, fmt.Errorf("Subsystem not present: %s", s)
	}
	return sub, nil
}

func (r *ReefPi) DM() *device_manager.DeviceManager {
	return r.dm
}

func (r *ReefPi) Store() storage.Store {
	return r.store
}

func (r *ReefPi) Telemetry() telemetry.Telemetry {
	return r.telemetry
}
