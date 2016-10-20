package raspi

import (
	"encoding/json"
	"fmt"
	pi "github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
)

func NewDeviceAPI(conn *pi.RaspiAdaptor) controller.CrudAPI {
	return &DeviceAPI{
		conn:    conn,
		devices: make(map[string]controller.Device),
	}
}

type DeviceAPI struct {
	conn    *pi.RaspiAdaptor
	devices map[string]controller.Device
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

func (d *DeviceAPI) Create(payload interface{}) error {
	if detail, ok := payload.(DeviceDetails); ok {
		dev, err := detail.Create(d.conn)
		if err != nil {
			return err
		}
		d.devices[dev.Name()] = dev
		return nil
	}
	return fmt.Errorf("%#v is not a device")
}

func (d *DeviceAPI) Get(name string) (interface{}, error) {
	if dev, ok := d.devices[name]; ok {
		return dev, nil
	}
	return nil, fmt.Errorf("Device does not exist")
}

func (d *DeviceAPI) Update(name string, payload interface{}) error {
	if dev, ok := payload.(controller.Device); ok {
		d.devices[name] = dev
		return nil
	}
	return fmt.Errorf("%#v is not a device")
}

func (d *DeviceAPI) Delete(name string) error {
	delete(d.devices, name)
	return nil
}

func (d *DeviceAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	for k, _ := range d.devices {
		list = append(list, k)
	}
	return &list, nil
}
