package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	pi "github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
	"log"
	"strconv"
)

type EquipmentAPI struct {
	conn *pi.RaspiAdaptor
	db   *bolt.DB
}

func NewEquipmentAPI(conn *pi.RaspiAdaptor, db *bolt.DB) (controller.CrudAPI, error) {
	err := db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte("equipments")) != nil {
			return nil
		}
		log.Println("Initializing DB for equipments bucket")
		_, err := tx.CreateBucket([]byte("equipments"))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &EquipmentAPI{
		conn: conn,
		db:   db,
	}, nil
}

func (e *EquipmentAPI) Create(payload interface{}) error {
	eq, ok := payload.(controller.Equipment)
	if !ok {
		return fmt.Errorf("Failed to typecast to equipment")
	}
	return e.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		id, _ := b.NextSequence()
		eq.ID = strconv.Itoa(int(id))
		data, err := json.Marshal(eq)
		if err != nil {
			return err
		}
		return b.Put([]byte(eq.ID), data)
	})
}

func (e *EquipmentAPI) Get(id string) (interface{}, error) {
	var data []byte
	var eq controller.Equipment
	err := e.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		data = b.Get([]byte(id))
		return nil
	})
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(data, &eq); err != nil {
		return nil, err
	}
	return &eq, nil
}

func (e *EquipmentAPI) Update(id string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return e.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		return b.Put([]byte(id), data)
	})
}

func (e *EquipmentAPI) Delete(id string) error {
	return e.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		return b.Delete([]byte(id))
	})
}
func (e *EquipmentAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	err := e.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var e controller.Equipment
			if err := json.Unmarshal(v, &e); err != nil {
				return err
			}
			entry := map[string]string{
				"id":   e.ID,
				"name": e.Name,
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
