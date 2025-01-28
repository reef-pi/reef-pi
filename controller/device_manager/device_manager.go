package device_manager

import (
	"log"
	"strings"

	"github.com/gorilla/mux"
	"github.com/reef-pi/rpi/i2c"

	"github.com/shirou/gopsutil/v4/host"

	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type DeviceManager struct {
	bus       i2c.Bus
	store     storage.Store
	jacks     *connectors.Jacks
	outlets   *connectors.Outlets
	inlets    *connectors.Inlets
	ais       *connectors.AnalogInputs
	drivers   *drivers.Drivers
	telemetry telemetry.Telemetry
}

func New(s settings.Settings, store storage.Store, t telemetry.Telemetry) *DeviceManager {
	mbus := i2c.MockBus()
	mbus.Bytes = make([]byte, 2) // ph sensor expects two bytes
	bus := i2c.Bus(mbus)
	stats, err := host.Info()
	if err == nil && strings.HasPrefix(stats.KernelArch, "arm") {
		b, err := i2c.New()
		if err != nil {
			log.Println("ERROR: Failed to initialize i2c. Error:", err)
			t.LogError("device-manager", "Failed to initialize i2c. Error:"+err.Error())
		} else {
			bus = b
		}
	}
	if s.RPI_PWMFreq <= 0 {
		log.Println("ERROR: Invalid  RPI PWM frequency:", s.RPI_PWMFreq, " falling back on default 100Hz")
		s.RPI_PWMFreq = 100
	}

	drvrs, err := drivers.NewDrivers(s, bus, store, t)
	if err != nil {
		log.Println("ERROR: failed to initialize drivers. Error:", err)
		t.LogError("device-manager", "failed to initialize drivers:"+err.Error())
	}
	log.Println("device-manager subsystem initialized with", drvrs.Size(), "drivers")

	return &DeviceManager{
		bus:       bus,
		drivers:   drvrs,
		jacks:     connectors.NewJacks(drvrs, store),
		outlets:   connectors.NewOutlets(drvrs, store),
		inlets:    connectors.NewInlets(drvrs, store),
		ais:       connectors.NewAnalogInputs(drvrs, store),
		telemetry: t,
	}
}

func (dm *DeviceManager) Setup() error {
	if err := dm.jacks.Setup(); err != nil {
		return err
	}
	if err := dm.outlets.Setup(); err != nil {
		return err
	}
	if err := dm.inlets.Setup(); err != nil {
		return err
	}
	if err := dm.ais.Setup(); err != nil {
		return err
	}
	return nil
}

func (dm *DeviceManager) Inlets() *connectors.Inlets {
	return dm.inlets
}
func (dm *DeviceManager) Outlets() *connectors.Outlets {
	return dm.outlets
}
func (dm *DeviceManager) AnalogInputs() *connectors.AnalogInputs {
	return dm.ais
}

func (dm *DeviceManager) Jacks() *connectors.Jacks {
	return dm.jacks
}

func (dm *DeviceManager) Drivers() *drivers.Drivers {
	return dm.drivers
}

func (dm *DeviceManager) LoadAPI(r *mux.Router) {
	dm.outlets.LoadAPI(r)
	dm.inlets.LoadAPI(r)
	dm.jacks.LoadAPI(r)
	dm.ais.LoadAPI(r)
	dm.drivers.LoadAPI(r)
}

func (dm *DeviceManager) Close() error {
	if err := dm.drivers.Close(); err != nil {
		return err
	}
	return dm.bus.Close()
}
