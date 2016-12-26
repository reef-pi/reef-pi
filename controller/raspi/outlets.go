package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/ranjib/reefer/controller"
	"gobot.io/x/gobot"
	"log"
	"strconv"
)

type OutletAPI struct {
	db    *bolt.DB
	store *controller.Store
	conn  gobot.Connection
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

func NewOutletAPI(conn gobot.Connection, db *bolt.DB) (*OutletAPI, error) {
	api := &OutletAPI{
		db:    db,
		store: controller.NewStore(db),
		conn:  conn,
	}
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
		b := tx.Bucket([]byte("outlets"))
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

func (o *OutletAPI) Delete(id string) error {
	return o.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("outlets"))
		return b.Delete([]byte(id))
	})
}

func (o *OutletAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	err := o.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("outlets"))
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var outlet controller.Outlet
			if err := json.Unmarshal(v, &outlet); err != nil {
				return err
			}
			entry := map[string]string{
				"id":   outlet.ID,
				"name": outlet.Name,
			}
			list = append(list, entry)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &list, nil
}

func (o *OutletAPI) Configure(id string, a controller.OuteltAction) error {
	var outlet controller.Outlet
	if err := o.store.Get("outlets", id, &outlet); err != nil {
		return err
	}
	return outlet.Perform(o.conn, a)
}
