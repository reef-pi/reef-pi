package device_manager

import (
	"context"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/reef-pi/hal"
	"github.com/reef-pi/rpi/i2c"

	"github.com/shirou/gopsutil/v4/host"

	"net/http"

	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type DeviceManager struct {
	bus                i2c.Bus
	store              storage.Store
	jacks              *connectors.Jacks
	outlets            *connectors.Outlets
	inlets             *connectors.Inlets
	ais                *connectors.AnalogInputs
	drivers            *drivers.Drivers
	telemetry          telemetry.Telemetry
	inletMonitorCtx    context.Context
	inletMonitorCancel context.CancelFunc
	inletMonitorWG     sync.WaitGroup
	inletMonitorOnce   sync.Once
	inletStates        inletStatePublisher
}

// Inlets expose synchronous reads only, so publish their state from a small
// background sampler. ATO keeps its existing cadence and topic; this sampler
// adds the common inlet topic for consumers that need inlet-level telemetry.
const inletTelemetryInterval = time.Second

type metricEmitter interface {
	EmitMetric(string, string, float64)
}

type inletState struct {
	name  string
	value int
}

type inletStatePublisher struct {
	last map[string]inletState
}

func (p *inletStatePublisher) publish(inlets *connectors.Inlets, t metricEmitter) {
	items, err := inlets.List()
	if err != nil {
		log.Printf("device-manager: failed to list inlets for telemetry: %v", err)
		return
	}
	if p.last == nil {
		p.last = make(map[string]inletState)
	}
	for _, inlet := range items {
		value, err := inlets.Read(inlet.ID)
		if err != nil {
			log.Printf("device-manager: failed to read inlet %s for telemetry: %v", inlet.Name, err)
			continue
		}
		state := inletState{name: inlet.Name, value: value}
		if previous, ok := p.last[inlet.ID]; ok && previous == state {
			continue
		}
		t.EmitMetric("inlet", inlet.Name+"-state", float64(value))
		p.last[inlet.ID] = state
	}
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
	monitorCtx, monitorCancel := context.WithCancel(context.Background())

	drvrs, err := drivers.NewDrivers(s, bus, store, t)
	if err != nil {
		log.Println("ERROR: failed to initialize drivers. Error:", err)
		t.LogError("device-manager", "failed to initialize drivers:"+err.Error())
	}
	log.Println("device-manager subsystem initialized with", drvrs.Size(), "drivers")

	dm := &DeviceManager{
		bus:                bus,
		drivers:            drvrs,
		jacks:              connectors.NewJacks(drvrs, store),
		outlets:            connectors.NewOutlets(drvrs, store),
		inlets:             connectors.NewInlets(drvrs, store),
		ais:                connectors.NewAnalogInputs(drvrs, store),
		telemetry:          t,
		inletMonitorCtx:    monitorCtx,
		inletMonitorCancel: monitorCancel,
	}
	drvrs.OnCreate = func(id string) {
		if err := dm.Provision(id); err != nil {
			log.Println("device-manager: auto-provision failed for driver", id, ":", err)
		}
	}
	return dm
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
	dm.inletMonitorOnce.Do(func() {
		dm.inletMonitorWG.Add(1)
		go dm.monitorInlets()
	})
	return nil
}

func (dm *DeviceManager) monitorInlets() {
	defer dm.inletMonitorWG.Done()
	ticker := time.NewTicker(inletTelemetryInterval)
	defer ticker.Stop()
	for {
		dm.inletStates.publish(dm.inlets, dm.telemetry)
		select {
		case <-dm.inletMonitorCtx.Done():
			return
		case <-ticker.C:
		}
	}
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

// Provision auto-creates connectors for all pins exposed by the driver with the given ID.
// Outlets are created for DigitalOutput pins, Inlets for DigitalInput pins,
// Jacks for PWM pins, and AnalogInputs for AnalogInput pins.
// Errors for individual connectors are logged but do not abort provisioning.
func (dm *DeviceManager) Provision(driverID string) error {
	dr, err := dm.drivers.Get(driverID)
	if err != nil {
		return fmt.Errorf("provision: driver %s not found: %w", driverID, err)
	}
	driverName := dr.Name

	for capStr, pins := range dr.PinMap {
		switch capStr {
		case hal.DigitalOutput.String():
			for _, pin := range pins {
				o := connectors.Outlet{
					Name:   fmt.Sprintf("%s-%d", driverName, pin),
					Driver: driverID,
					Pin:    pin,
				}
				if err := dm.outlets.Create(o); err != nil {
					log.Printf("device-manager: provision outlet pin %d for driver %s: %v", pin, driverName, err)
				}
			}
		case hal.DigitalInput.String():
			for _, pin := range pins {
				i := connectors.Inlet{
					Name:   fmt.Sprintf("%s-%d", driverName, pin),
					Driver: driverID,
					Pin:    pin,
				}
				if err := dm.inlets.Create(i); err != nil {
					log.Printf("device-manager: provision inlet pin %d for driver %s: %v", pin, driverName, err)
				}
			}
		case hal.PWM.String():
			for _, pin := range pins {
				j := connectors.Jack{
					Name:   fmt.Sprintf("%s-%d", driverName, pin),
					Driver: driverID,
					Pins:   []int{pin},
				}
				if err := dm.jacks.Create(j); err != nil {
					log.Printf("device-manager: provision jack pin %d for driver %s: %v", pin, driverName, err)
				}
			}
		case hal.AnalogInput.String():
			for _, pin := range pins {
				ai := connectors.AnalogInput{
					Name:   fmt.Sprintf("%s-%d", driverName, pin),
					Driver: driverID,
					Pin:    pin,
				}
				if err := dm.ais.Create(ai); err != nil {
					log.Printf("device-manager: provision analog input pin %d for driver %s: %v", pin, driverName, err)
				}
			}
		}
	}
	return nil
}

func (dm *DeviceManager) LoadAPI(r chi.Router) {
	dm.outlets.LoadAPI(r)
	dm.inlets.LoadAPI(r)
	dm.jacks.LoadAPI(r)
	dm.ais.LoadAPI(r)
	dm.drivers.LoadAPI(r)
	r.Post("/api/drivers/{id}/provision", dm.provisionHandler)
}

func (dm *DeviceManager) provisionHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := dm.Provision(id); err != nil {
		utils.ErrorResponse(http.StatusInternalServerError, "Failed to provision. Error: "+err.Error(), w)
		return
	}
}

func (dm *DeviceManager) Close() error {
	dm.inletMonitorCancel()
	dm.inletMonitorWG.Wait()
	if err := dm.drivers.Close(); err != nil {
		return err
	}
	return dm.bus.Close()
}
