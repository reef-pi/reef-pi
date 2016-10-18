package raspi

import (
	"fmt"
	"github.com/ranjib/reefer/controller"
)

func NewDeviceAPI() controller.CrudAPI {
	return &DeviceAPI{
		devices: make(map[string]controller.Device),
	}
}

type DeviceAPI struct {
	devices map[string]controller.Device
}

func (d *DeviceAPI) Create(payload interface{}) error {
	if dev, ok := payload.(controller.Device); ok {
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
	var ret []interface{}
	for k, _ := range d.devices {
		ret = append(ret, k)
	}
	return &ret, nil
}
