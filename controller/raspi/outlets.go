package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/ranjib/reefer/controller"
	"log"
	"strconv"
)

type OutletAPI struct {
	db *bolt.DB
}

var (
	DEFAULT_OUTLETS = map[string]string{
		"AC_110_1": "",
		"AC_110_2": "",
		"AC_110_3": "",
		"AC_110_4": "",
		"AC_110_5": "",
		"AC_110_6": "",
	}
)

func NewOutletAPI(db *bolt.DB) (*OutletAPI, error) {
	api := &OutletAPI{db: db}
	err := db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte("outlets")) != nil {
			return nil
		}
		log.Println("Initializing DB for outlets bucket")
		_, err := tx.CreateBucket([]byte("outlets"))
		return err
	})
	if err != nil {
		return nil, err
	}
	return api, nil
}

func (o *OutletAPI) Create(payload interface{}) error {
	outlet, ok := payload.(controller.Outlet)
	if !ok {
		return fmt.Errorf("Failed to typecast to outlet")
	}

	return o.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("outlet"))
		id, _ := b.NextSequence()
		outlet.ID = strconv.Itoa(int(id))
		data, err := json.Marshal(outlet)
		if err != nil {
			return err
		}
		return b.Put([]byte(outlet.ID), data)
	})
}

func (o *OutletAPI) Get(id string) (interface{}, error) {
	var data []byte

	err := o.db.View(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("outlets"))
		data = bu.Get([]byte(id))
		return nil
	})
	if err != nil {
		return nil, err
	}
	var outlet controller.Outlet
	if data != nil {
		if err := json.Unmarshal(data, &outlet); err != nil {
			return nil, err
		}
	}
	return outlet, nil
}

func (o *OutletAPI) Update(id string, payload interface{}) error {
	outlet, ok := payload.(controller.Outlet)
	if !ok {
		fmt.Errorf("Failed to typecast payload to outlet")
	}
	buf, err := json.Marshal(outlet)
	if err != nil {
		return err
	}
	return o.db.Update(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("outlets"))
		return bu.Put([]byte(outlet.ID), buf)
	})
}

func (o *OutletAPI) Delete(_ string) error {
	return nil
}

func (o *OutletAPI) List() (*[]interface{}, error) {
	var ret []interface{}
	return &ret, nil
}
