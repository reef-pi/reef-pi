package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	pi "github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
	"log"
)

type DeviceResponse struct {
	Type   string `json:"type"`
	Config []byte `json:"config"`
}
type DeviceDetails struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

func (d *DeviceDetails) Create(conn *pi.RaspiAdaptor) (controller.Device, error) {
	switch d.Type {
	case "relay":
		var config controller.RelayConfig
		if err := json.Unmarshal(d.Config, &config); err != nil {
			return nil, err
		}
		return controller.NewRelay(config, conn), nil

	case "doser":
		var config controller.DoserConfig
		if err := json.Unmarshal(d.Config, &config); err != nil {
			return nil, err
		}
		return controller.NewDoser(config, conn), nil
	}
	return nil, fmt.Errorf("Invalid device type: %s", d.Type)
}

type DeviceAPI struct {
	conn *pi.RaspiAdaptor
	db   *bolt.DB
}

func NewDeviceAPI(conn *pi.RaspiAdaptor, db *bolt.DB) (controller.CrudAPI, error) {
	err := db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte("devices")) != nil {
			return nil
		}
		log.Println("Initializing DB for devices bucket")
		_, err := tx.CreateBucket([]byte("devices"))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &DeviceAPI{
		conn: conn,
		db:   db,
	}, nil
}

func (d *DeviceAPI) Create(payload interface{}) error {
	detail, ok := payload.(DeviceDetails)
	if !ok {
		return fmt.Errorf("%#v is not a device")
	}
	dev, err := detail.Create(d.conn)
	if err != nil {
		return err
	}
	buf, err := json.Marshal(dev.Config())
	if err != nil {
		return err
	}
	dr := DeviceResponse{
		Type:   dev.Type(),
		Config: buf,
	}
	data, err := json.Marshal(dr)
	if err != nil {
		return err
	}
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("devices"))
		return b.Put([]byte(dev.Name()), data)
	})
}

func (d *DeviceAPI) Get(name string) (interface{}, error) {
	var data []byte
	var dr DeviceResponse
	err := d.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("devices"))
		data = b.Get([]byte(name))
		return nil
	})
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, fmt.Errorf("Device not present")
	}
	if err := json.Unmarshal(data, &dr); err != nil {
		return nil, err
	}
	var dev interface{}
	switch dr.Type {
	case "relay":
		var c controller.RelayConfig
		if err := json.Unmarshal(dr.Config, &c); err != nil {
			return nil, err
		}
		dev = controller.NewRelay(c, d.conn)
		fmt.Println(c)
	case "doser":
	default:
		return nil, fmt.Errorf("Unknown device type:%s", dr.Type)
	}
	return dev, nil
}

func (d *DeviceAPI) Update(name string, payload interface{}) error {
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("devices"))
		return b.Put([]byte(name), nil)
	})
}

func (d *DeviceAPI) Delete(name string) error {
	return d.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("devices"))
		return b.Delete([]byte(name))
	})
}

func (d *DeviceAPI) List() (*[]interface{}, error) {
	list := []interface{}{}

	err := d.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("devices"))
		c := b.Cursor()
		for k, _ := c.First(); k != nil; k, _ = c.Next() {
			list = append(list, string(k))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &list, nil
}
