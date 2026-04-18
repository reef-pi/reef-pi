// Package tasmota implements a reef-pi driver for Tasmota-flashed smart plugs
// with support for multi-outlet devices (e.g. Sonoff 4CH, dual-relay strips)
// and optional HTTP basic authentication.
package tasmota

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"time"

	"github.com/reef-pi/hal"
)

const (
	paramAddress  = "Address"
	paramOutlets  = "Outlets"
	paramUsername = "Username"
	paramPassword = "Password"
	maxOutlets    = 64
)

// factory is the singleton DriverFactory for the multi-outlet Tasmota driver.
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
				Name:         "Tasmota",
				Description:  "Tasmota HTTP driver with multi-outlet and authentication support",
				Capabilities: []hal.Capability{hal.DigitalOutput},
			},
			parameters: []hal.ConfigParameter{
				{
					Name:    paramAddress,
					Type:    hal.String,
					Order:   0,
					Default: "192.168.1.100",
				},
				{
					Name:    paramOutlets,
					Type:    hal.Integer,
					Order:   1,
					Default: "1",
				},
				{
					Name:    paramUsername,
					Type:    hal.String,
					Order:   2,
					Default: "",
				},
				{
					Name:    paramPassword,
					Type:    hal.String,
					Order:   3,
					Default: "",
				},
			},
		}
	})
	return drv
}

func (f *factory) Metadata() hal.Metadata         { return f.meta }
func (f *factory) GetParameters() []hal.ConfigParameter { return f.parameters }

func (f *factory) ValidateParameters(params map[string]interface{}) (bool, map[string][]string) {
	failures := make(map[string][]string)
	if v, ok := params[paramAddress]; !ok || fmt.Sprint(v) == "" {
		failures[paramAddress] = append(failures[paramAddress], paramAddress+" is required")
	}
	if v, ok := params[paramOutlets]; ok {
		n, err := strconv.Atoi(fmt.Sprint(v))
		if err != nil || n < 1 || n > maxOutlets {
			failures[paramOutlets] = append(failures[paramOutlets], fmt.Sprintf("%s must be between 1 and %d", paramOutlets, maxOutlets))
		}
	}
	return len(failures) == 0, failures
}

func (f *factory) NewDriver(params map[string]interface{}, _ interface{}) (hal.Driver, error) {
	if valid, failures := f.ValidateParameters(params); !valid {
		return nil, errors.New(hal.ToErrorString(failures))
	}
	address := fmt.Sprint(params[paramAddress])
	outlets := 1
	if v, ok := params[paramOutlets]; ok {
		if n, err := strconv.Atoi(fmt.Sprint(v)); err == nil && n > 0 && n <= maxOutlets {
			outlets = n
		}
	}
	username := fmt.Sprint(params[paramUsername])
	password := fmt.Sprint(params[paramPassword])

	pins := make([]hal.DigitalOutputPin, 0, maxOutlets)
	for i := 0; i < outlets; i++ {
		pins = append(pins, &outletPin{
			index:    i + 1, // Tasmota uses 1-based Power numbering
			address:  address,
			username: username,
			password: password,
		})
	}
	return &driver{meta: f.meta, pins: pins}, nil
}

// driver implements hal.DigitalOutputDriver for a Tasmota device.
type driver struct {
	meta hal.Metadata
	pins []hal.DigitalOutputPin
}

func (d *driver) Metadata() hal.Metadata { return d.meta }
func (d *driver) Close() error           { return nil }

func (d *driver) Pins(cap hal.Capability) ([]hal.Pin, error) {
	if cap != hal.DigitalOutput {
		return nil, fmt.Errorf("unsupported capability: %s", cap.String())
	}
	result := make([]hal.Pin, len(d.pins))
	for i, p := range d.pins {
		result[i] = p
	}
	return result, nil
}

func (d *driver) DigitalOutputPins() []hal.DigitalOutputPin { return d.pins }

func (d *driver) DigitalOutputPin(n int) (hal.DigitalOutputPin, error) {
	if n < 0 || n >= len(d.pins) {
		return nil, fmt.Errorf("tasmota: pin %d out of range (0..%d)", n, len(d.pins)-1)
	}
	return d.pins[n], nil
}

// outletPin controls a single Tasmota relay via the HTTP API.
type outletPin struct {
	index    int // 1-based outlet index
	address  string
	username string
	password string
}

func (p *outletPin) Name() string   { return fmt.Sprintf("outlet-%d", p.index) }
func (p *outletPin) Number() int    { return p.index - 1 }
func (p *outletPin) Close() error   { return nil }

func (p *outletPin) LastState() bool {
	resp, err := p.doCommand(fmt.Sprintf("Power%d", p.index))
	if err != nil {
		return false
	}
	key := fmt.Sprintf("POWER%d", p.index)
	if p.index == 1 {
		// Single-outlet devices may respond with just "POWER"
		if v, ok := resp["POWER"]; ok {
			return v == "ON"
		}
	}
	v, ok := resp[key]
	if !ok {
		return false
	}
	return v == "ON"
}

func (p *outletPin) Write(on bool) error {
	state := "off"
	if on {
		state = "on"
	}
	_, err := p.doCommand(fmt.Sprintf("Power%d%%20%s", p.index, state))
	return err
}

// doCommand sends a GET request to the Tasmota /cm endpoint and returns the JSON body.
func (p *outletPin) doCommand(cmd string) (map[string]string, error) {
	rawURL := fmt.Sprintf("http://%s/cm?cmnd=%s", p.address, cmd)
	if p.username != "" {
		rawURL = fmt.Sprintf("http://%s/cm?user=%s&password=%s&cmnd=%s",
			p.address,
			url.QueryEscape(p.username),
			url.QueryEscape(p.password),
			cmd,
		)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(rawURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tasmota: HTTP %d: %s", resp.StatusCode, body)
	}
	var result map[string]string
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("tasmota: failed to parse response %q: %w", body, err)
	}
	return result, nil
}
