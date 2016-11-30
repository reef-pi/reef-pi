package raspi

import (
	"fmt"
	"github.com/boltdb/bolt"
	pi "github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
	"log"
	"time"
)

type Raspi struct {
	db        *bolt.DB
	conn      *pi.RaspiAdaptor
	schedules map[controller.Device]controller.Scheduler
	modules   map[string]controller.Module
	lighting  *Lighting
	deviceAPI controller.CrudAPI
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

func New() (*Raspi, error) {
	db, err := bolt.Open("reefer.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}
	conn := pi.NewRaspiAdaptor("raspi")
	deviceAPI, err := NewDeviceAPI(conn, db)
	if err != nil {
		return nil, err
	}
	r := &Raspi{
		db:        db,
		conn:      conn,
		deviceAPI: deviceAPI,
		schedules: make(map[controller.Device]controller.Scheduler),
		lighting:  NewLighting(),
	}
	return r, nil
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
	defer r.db.Close()
	return nil
}
