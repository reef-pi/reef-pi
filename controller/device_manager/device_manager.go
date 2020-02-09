package device_manager

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/drivers"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/rpi/i2c"
	"log"
)

/*

  // light-jack
	pv := make(map[int]float64)
	if err := c.jacks.Control(jack, pv); err != nil {
	j, err := c.jacks.Get(l.Jack)
	for i, pin := range j.Pins {}

  // ph - ai
	v, err := c.ais.Read(p.AnalogInput)
	// ato - inlet
	return c.inlets.Read(a.Inlet)

	// equipment - outlets
		if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
	outlet, err := c.outlets.Get(eq.Outlet)
	if err := c.outlets.Configure(eq.Outlet, eq.On); err != nil {
		log.Println("Failed to configure outlet")
		return err
	}

*/

type DeviceManager struct {
	bus     i2c.Bus
	store   storage.Store
	jacks   *connectors.Jacks
	outlets *connectors.Outlets
	inlets  *connectors.Inlets
	ais     *connectors.AnalogInputs
	drivers *drivers.Drivers
}

func New(s settings.Settings, store storage.Store) *DeviceManager {
	mbus := i2c.MockBus()
	mbus.Bytes = make([]byte, 2) // ph sensor expects two bytes
	bus := i2c.Bus(mbus)
	if !s.Capabilities.DevMode {
		b, err := i2c.New()
		if err != nil {
			log.Println("ERROR: Failed to initialize i2c. Error:", err)
			//logError(store, "device-i2c", "Failed to initialize i2c. Error:"+err.Error())
		} else {
			bus = b
		}
	}
	if s.RPI_PWMFreq <= 0 {
		log.Println("ERROR: Invalid  RPI PWM frequency:", s.RPI_PWMFreq, " falling back on default 100Hz")
		s.RPI_PWMFreq = 100
	}

	drvrs, err := drivers.NewDrivers(s, bus, store)
	if err != nil {
		log.Println("ERROR: failed to initialize drivers. Error:", err)
		//logError(store, "driver-init", err.Error())
	}
	return &DeviceManager{
		bus:     bus,
		drivers: drvrs,
		jacks:   connectors.NewJacks(drvrs, store),
		outlets: connectors.NewOutlets(drvrs, store),
		inlets:  connectors.NewInlets(drvrs, store),
		ais:     connectors.NewAnalogInputs(drvrs, store),
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
