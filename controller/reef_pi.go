package controller

import (
	"fmt"
	"github.com/gorilla/sessions"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"github.com/reef-pi/rpi/i2c"
	"log"
	"net/http"
	"time"
)

const Bucket = types.ReefPiBucket

type ReefPi struct {
	store   types.Store
	jacks   *connectors.Jacks
	outlets *connectors.Outlets
	inlets  *connectors.Inlets
	drivers *drivers.Drivers

	subsystems map[string]types.Subsystem
	settings   settings.Settings
	telemetry  types.Telemetry
	version    string
	h          *HealthChecker
	bus        i2c.Bus
	cookiejar  *sessions.CookieStore
}

func New(version, database string) (*ReefPi, error) {
	store, err := utils.NewStore(database)
	cookiejar := sessions.NewCookieStore([]byte("reef-pi-key"))
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
	bus := i2c.Bus(i2c.MockBus())
	if !s.Capabilities.DevMode {
		b, err := i2c.New()
		if err != nil {
			log.Println("ERROR: Failed to initialize i2c. Error:", err)
			logError(store, "device-i2c", "Failed to initialize i2c. Error:"+err.Error())
		} else {
			bus = b
		}
	}
	if s.RPI_PWMFreq <= 0 {
		log.Println("ERROR: Invalid  RPI PWM frequency:", s.RPI_PWMFreq, " falling back on default 100Hz")
		s.RPI_PWMFreq = 100
	}
	pi := connectors.NewRPIPWMDriver(s.RPI_PWMFreq, s.Capabilities.DevMode)
	pConfig := connectors.DefaultPCA9685Config
	pConfig.DevMode = true

	pca9685, err := connectors.NewPCA9685(i2c.MockBus(), pConfig)
	if err != nil {
		log.Println("ERROR: Failed to initialize pca9685 driver with mock i2c bus. Error:", err)
		return nil, err
	}
	if s.PCA9685 {
		pConfig.DevMode = s.Capabilities.DevMode
		p, err := connectors.NewPCA9685(bus, pConfig)
		if err != nil {
			log.Println("ERROR: Failed to initialize pca9685 driver. Using mock bus, all PCA9685 PWM calls will be ignored")
			logError(store, "device-pca9685", "Failed to initialize pca9685 driver. Error:"+err.Error())
		} else {
			pca9685 = p
		}
	}
	jacks := connectors.NewJacks(store, pi, pca9685)
	outlets := connectors.NewOutlets(store)
	outlets.DevMode = s.Capabilities.DevMode
	inlets := connectors.NewInlets(store)
	inlets.DevMode = s.Capabilities.DevMode
	drvrs, err := drivers.NewDrivers(s, bus, store)

	r := &ReefPi{
		bus:        bus,
		store:      store,
		settings:   s,
		telemetry:  telemetry,
		jacks:      jacks,
		outlets:    outlets,
		inlets:     inlets,
		drivers:    drvrs,
		subsystems: make(map[string]types.Subsystem),
		version:    version,
		cookiejar:  cookiejar,
	}
	if s.Capabilities.HealthCheck {
		r.h = NewHealthChecker(1*time.Minute, s.HealthCheck, telemetry, store)
	}
	return r, nil
}

func (r *ReefPi) Start() error {
	if err := r.setUpErrorBucket(); err != nil {
		return err
	}
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

func (r *ReefPi) Subsystem(s string) (types.Subsystem, error) {
	sub, ok := r.subsystems[s]
	if !ok {
		return nil, fmt.Errorf("Subsystem not present: %s", s)
	}
	return sub, nil
}

func (r *ReefPi) Controller() types.Controller {
	return types.NewController(
		r.telemetry,
		r.store,
		r.LogError,
		r.Subsystem,
	)
}

func (r *ReefPi) BasicAuth(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, req *http.Request) {
		authSession, err := r.cookiejar.Get(req, "auth")
		if err != nil {
			log.Println("DEBUG:", "No session")
			http.Error(w, "Unauthorized.", 401)
			return
		}
		if user := authSession.Values["user"]; user == nil {
			log.Println("DEBUG:", "No session")
			http.Error(w, "Unauthorized.", 401)
			return
		}
		fn(w, req)
	}
}
