package raspi

import (
	"encoding/json"
	"github.com/boltdb/bolt"
	"log"
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
	return api, api.Update(DEFAULT_OUTLETS)
}

func (o *OutletAPI) Get() (interface{}, error) {
	var data []byte

	err := o.db.View(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("outlets"))
		data = bu.Get([]byte("config"))
		return nil
	})
	if err != nil {
		return nil, err
	}
	outlets := map[string]string{}
	if data != nil {
		if err := json.Unmarshal(data, &outlets); err != nil {
			return nil, err
		}
	}
	return outlets, nil
}

func (o *OutletAPI) Update(outlets interface{}) error {
	buf, err := json.Marshal(outlets)
	if err != nil {
		return err
	}
	return o.db.Update(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("outlets"))
		return bu.Put([]byte("config"), buf)
	})
}
