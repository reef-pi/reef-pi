package drivers

import (
	"encoding/json"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const (
	DriverBucket = storage.DriverBucket
	_rpi         = "rpi"
)

// swagger:model driver
type Driver struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Type       string                 `json:"type"`
	Config     json.RawMessage        `json:"config"`
	PinMap     map[string][]int       `json:"pinmap"`
	Parameters map[string]interface{} `json:"parameters"`
}

func (dr *Driver) loadPinMap(d hal.Driver) {
	pinmap := make(map[string][]int)
	for _, cap := range d.Metadata().Capabilities {
		pins, err := d.Pins(cap)
		if err != nil {
			continue
		}
		var ps []int
		for _, pin := range pins {
			ps = append(ps, pin.Number())
		}
		pinmap[cap.String()] = ps
	}
	dr.PinMap = pinmap
}
