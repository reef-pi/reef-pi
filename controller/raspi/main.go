package raspi

import (
	"github.com/boltdb/bolt"
	"github.com/ranjib/reefer/controller"
	pi "gobot.io/x/gobot/platforms/raspi"
	"log"
	"time"
)

type Raspi struct {
	store        *controller.Store
	conn         *pi.Adaptor
	boardAPI     controller.CrudAPI
	outletAPI    controller.OutletAPI
	jobAPI       *JobAPI
	equipmentAPI controller.CrudAPI
}

func (r *Raspi) Name() string {
	return "raspberry-pi"
}

func New() (*Raspi, error) {
	db, err := bolt.Open("reefer.db", 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}
	store := controller.NewStore(db)
	conn := pi.NewAdaptor()
	boardAPI, err := NewBoardAPI(store)
	if err != nil {
		return nil, err
	}
	outletAPI, err := NewOutletAPI(conn, store)
	if err != nil {
		return nil, err
	}
	jobAPI, err := NewJobAPI(conn, store)
	if err != nil {
		return nil, err
	}
	equipmentAPI, err := NewEquipmentAPI(conn, store)
	if err != nil {
		return nil, err
	}
	r := &Raspi{
		store:        store,
		conn:         conn,
		outletAPI:    outletAPI,
		boardAPI:     boardAPI,
		jobAPI:       jobAPI,
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
	r.store.Close()
	log.Println("Stopped Controller:", r.Name())
	return nil
}
