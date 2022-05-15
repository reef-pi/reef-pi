package daemon

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
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
	subsystems *controller.SubsystemComposite
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
	tele := telemetry.Initialize(s.Name, Bucket, store, fn, s.Prometheus)
	r := &ReefPi{
		store:      store,
		settings:   s,
		telemetry:  tele,
		subsystems: controller.NewSubsystemComposite(),
		version:    version,
		a:          utils.NewAuth(Bucket, store),
		dm:         device_manager.New(s, store, tele),
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

func (r *ReefPi) Stop() error {
	r.subsystems.UnloadAll()
	if r.settings.Capabilities.HealthCheck {
		r.h.Stop()
	}
	r.dm.Close()
	log.Println("reef-pi is shutting down")
	r.store.Close()
	return nil
}

func (r *ReefPi) Subsystem(s string) (controller.Subsystem, error) {
	return r.subsystems.Sub(s)
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
