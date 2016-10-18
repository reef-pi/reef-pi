package raspi

import (
	"fmt"
	"github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
	"log"
)

type Raspi struct {
	config    *Config
	devices   map[string]controller.Device
	schedules map[controller.Device]controller.Scheduler
	modules   map[string]controller.Module
}

func (r *Raspi) Name() string {
	return "raspberry-pi"
}

func (c *Raspi) GetModule(name string) (controller.Module, error) {
	module, ok := c.modules[name]
	if !ok {
		return nil, fmt.Errorf("No such module: '%s'", name)
	}
	return module, nil
}

func (c *Raspi) GetDevice(name string) (controller.Device, error) {
	dev, ok := c.devices[name]
	if !ok {
		return nil, fmt.Errorf("No such device: '%s'", name)
	}
	return dev, nil
}

func New(config *Config) *Raspi {
	r := &Raspi{
		schedules: make(map[controller.Device]controller.Scheduler),
	}
	r.loadDevices(config)
	r.loadModules()
	return r
}

func (r *Raspi) loadDevices(config *Config) {
	conn := raspi.NewRaspiAdaptor("raspi")
	r.devices = make(map[string]controller.Device)
	r.Devices().Create(controller.NewRelay("Relay 1", conn, config.Relay1))
	r.Devices().Create(controller.NewRelay("Relay 2", conn, config.Relay2))
	r.Devices().Create(controller.NewDoser("Doser 1", conn, config.Doser1))
	r.Devices().Create(controller.NewDoser("Doser 2", conn, config.Doser2))
}

func (r *Raspi) loadModules() {
	fmt.Println("Loading ATO module")
	r.modules = make(map[string]controller.Module)
	r.modules["ato"] = &controller.ATO{}
}

func (r *Raspi) Schedule(dev controller.Device, sched controller.Scheduler) error {
	if _, ok := r.schedules[dev]; ok {
		return fmt.Errorf("Device %s already scheduled", dev.Name())
	}
	log.Printf("Added %s[ %s]\n", sched.Name(), dev.Name())
	r.schedules[dev] = sched
	if !sched.IsRunning() {
		go sched.Start(dev)
	}
	return nil
}

func (r *Raspi) Start() error {
	for dev, sched := range r.schedules {
		go sched.Start(dev)
	}
	log.Println("Started Controller:", r.Name())
	return nil
}

func (r *Raspi) Stop() error {
	for _, sched := range r.schedules {
		sched.Stop()
	}
	log.Println("Stopped Controller:", r.Name())
	return nil
}
