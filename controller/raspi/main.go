package raspi

import (
	"github.com/boltdb/bolt"
	"github.com/ranjib/reefer/controller"
	pi "gobot.io/x/gobot/platforms/raspi"
	"log"
	"time"
)

type Raspi struct {
	db           *bolt.DB
	conn         *pi.Adaptor
	lighting     *Lighting
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
	conn := pi.NewAdaptor()
	boardAPI, err := NewBoardAPI(db)
	if err != nil {
		return nil, err
	}
	outletAPI, err := NewOutletAPI(conn, db)
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
