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
	db           *bolt.DB
	conn         *pi.RaspiAdaptor
	modules      map[string]controller.Module
	lighting     *Lighting
	boardAPI     controller.CrudAPI
	outletAPI    controller.CrudAPI
	jobAPI       *JobAPI
	equipmentAPI controller.CrudAPI
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
	boardAPI, err := NewBoardAPI(db)
	if err != nil {
		return nil, err
	}
	outletAPI, err := NewOutletAPI(db)
	if err != nil {
		return nil, err
	}
	jobAPI, err := NewJobAPI(conn, db)
	if err != nil {
		return nil, err
	}
	equipmentAPI, err := NewEquipmentAPI(conn, db)
	if err != nil {
		return nil, err
	}
	r := &Raspi{
		db:           db,
		conn:         conn,
		outletAPI:    outletAPI,
		boardAPI:     boardAPI,
		jobAPI:       jobAPI,
		lighting:     NewLighting(),
		equipmentAPI: equipmentAPI,
	}
	return r, nil
}

func (r *Raspi) Start() error {
	r.jobAPI.Start()
	r.logStartTime()
	log.Println("Started Controller:", r.Name())
	return nil
}

func (r *Raspi) Stop() error {
	r.jobAPI.Stop()
	r.logStopTime()
	r.db.Close()
	log.Println("Stopped Controller:", r.Name())
	return nil
}
