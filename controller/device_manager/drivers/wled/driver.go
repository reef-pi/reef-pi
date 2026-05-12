// Package wled implements a reef-pi driver for WLED-flashed LED controllers.
// WLED (https://kno.wled.ge/) is an open-source firmware for ESP8266/ESP32
// devices that provides HTTP and JSON APIs for controlling addressable LED strips.
package wled

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/reef-pi/hal"
)

const (
	paramAddress = "Address"
)

// factory is the singleton DriverFactory for the WLED driver.
type factory struct {
	meta       hal.Metadata
	parameters []hal.ConfigParameter
}

var (
	drv  *factory
	once sync.Once
)

// Factory returns the singleton DriverFactory.
func Factory() hal.DriverFactory {
	once.Do(func() {
		drv = &factory{
			meta: hal.Metadata{
				Name:         "WLED",
				Description:  "WLED LED controller driver (HTTP JSON API)",
				Capabilities: []hal.Capability{hal.DigitalOutput, hal.PWM},
			},
			parameters: []hal.ConfigParameter{
				{
					Name:    paramAddress,
					Type:    hal.String,
					Order:   0,
					Default: "192.168.1.100",
				},
			},
		}
	})
	return drv
}

func (f *factory) Metadata() hal.Metadata              { return f.meta }
func (f *factory) GetParameters() []hal.ConfigParameter { return f.parameters }

func (f *factory) ValidateParameters(params map[string]interface{}) (bool, map[string][]string) {
	failures := make(map[string][]string)
	if v, ok := params[paramAddress]; !ok || fmt.Sprint(v) == "" {
		failures[paramAddress] = append(failures[paramAddress], paramAddress+" is required")
	}
	return len(failures) == 0, failures
}

func (f *factory) NewDriver(params map[string]interface{}, _ interface{}) (hal.Driver, error) {
	if valid, failures := f.ValidateParameters(params); !valid {
		return nil, errors.New(hal.ToErrorString(failures))
	}
	address := fmt.Sprint(params[paramAddress])
	ch := &wledChannel{address: address}
	return &driver{meta: f.meta, ch: ch}, nil
}

// driver implements hal.DigitalOutputDriver and hal.PWMDriver for a WLED device.
type driver struct {
	meta hal.Metadata
	ch   *wledChannel
}

func (d *driver) Metadata() hal.Metadata { return d.meta }
func (d *driver) Close() error           { return nil }

func (d *driver) Pins(cap hal.Capability) ([]hal.Pin, error) {
	switch cap {
	case hal.DigitalOutput, hal.PWM:
		return []hal.Pin{d.ch}, nil
	default:
		return nil, fmt.Errorf("unsupported capability: %s", cap.String())
	}
}

func (d *driver) DigitalOutputPins() []hal.DigitalOutputPin {
	return []hal.DigitalOutputPin{d.ch}
}

func (d *driver) DigitalOutputPin(n int) (hal.DigitalOutputPin, error) {
	if n != 0 {
		return nil, fmt.Errorf("wled: pin %d out of range, only pin 0 exists", n)
	}
	return d.ch, nil
}

func (d *driver) PWMChannels() []hal.PWMChannel {
	return []hal.PWMChannel{d.ch}
}

func (d *driver) PWMChannel(n int) (hal.PWMChannel, error) {
	if n != 0 {
		return nil, fmt.Errorf("wled: channel %d out of range, only channel 0 exists", n)
	}
	return d.ch, nil
}

// wledChannel controls a WLED device via its JSON API.
// It implements both hal.DigitalOutputPin and hal.PWMChannel.
type wledChannel struct {
	address string
}

func (c *wledChannel) Name() string { return "wled" }
func (c *wledChannel) Number() int  { return 0 }
func (c *wledChannel) Close() error { return nil }

// wledState is the subset of WLED JSON state we read/write.
type wledState struct {
	On  bool `json:"on"`
	Bri int  `json:"bri"` // 1-255
}

func (c *wledChannel) getState() (wledState, error) {
	url := fmt.Sprintf("http://%s/json/state", c.address)
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return wledState{}, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return wledState{}, err
	}
	var state wledState
	if err := json.Unmarshal(body, &state); err != nil {
		return wledState{}, fmt.Errorf("wled: failed to parse state: %w", err)
	}
	return state, nil
}

func (c *wledChannel) setState(state wledState) error {
	url := fmt.Sprintf("http://%s/json/state", c.address)
	payload, err := json.Marshal(state)
	if err != nil {
		return err
	}
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("wled: HTTP %d: %s", resp.StatusCode, body)
	}
	return nil
}

// LastState returns whether the WLED device is currently on.
func (c *wledChannel) LastState() bool {
	state, err := c.getState()
	if err != nil {
		return false
	}
	return state.On
}

// Write turns the WLED device on or off.
func (c *wledChannel) Write(on bool) error {
	return c.setState(wledState{On: on})
}

// Set sets the WLED brightness from a 0–100 percent value.
func (c *wledChannel) Set(percent float64) error {
	if percent < 0 {
		percent = 0
	}
	if percent > 100 {
		percent = 100
	}
	on := percent > 0
	bri := int(math.Round(percent * 255.0 / 100.0))
	if bri < 1 && on {
		bri = 1
	}
	return c.setState(wledState{On: on, Bri: bri})
}
