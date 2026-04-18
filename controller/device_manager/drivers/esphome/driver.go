// Package esphome implements a reef-pi driver for ESPHome devices.
// ESPHome (https://esphome.io/) devices expose a native REST API that allows
// controlling switches and reading sensor values over HTTP.
package esphome

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/reef-pi/hal"
)

const (
	paramAddress    = "Address"
	paramEntityID   = "EntityID"
	paramEntityType = "EntityType"

	entityTypeSwitch = "switch"
	entityTypeSensor = "sensor"
)

// factory is the singleton DriverFactory for the ESPHome driver.
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
				Name:         "ESPHome",
				Description:  "ESPHome device driver (native REST API)",
				Capabilities: []hal.Capability{hal.DigitalOutput, hal.AnalogInput},
			},
			parameters: []hal.ConfigParameter{
				{
					Name:    paramAddress,
					Type:    hal.String,
					Order:   0,
					Default: "192.168.1.100",
				},
				{
					Name:    paramEntityID,
					Type:    hal.String,
					Order:   1,
					Default: "light",
				},
				{
					Name:    paramEntityType,
					Type:    hal.String,
					Order:   2,
					Default: entityTypeSwitch,
				},
			},
		}
	})
	return drv
}

func (f *factory) Metadata() hal.Metadata               { return f.meta }
func (f *factory) GetParameters() []hal.ConfigParameter { return f.parameters }

func (f *factory) ValidateParameters(params map[string]interface{}) (bool, map[string][]string) {
	failures := make(map[string][]string)
	if v, ok := params[paramAddress]; !ok || fmt.Sprint(v) == "" {
		failures[paramAddress] = append(failures[paramAddress], paramAddress+" is required")
	}
	if v, ok := params[paramEntityID]; !ok || fmt.Sprint(v) == "" {
		failures[paramEntityID] = append(failures[paramEntityID], paramEntityID+" is required")
	}
	if v, ok := params[paramEntityType]; ok {
		t := fmt.Sprint(v)
		if t != entityTypeSwitch && t != entityTypeSensor {
			failures[paramEntityType] = append(failures[paramEntityType],
				paramEntityType+" must be '"+entityTypeSwitch+"' or '"+entityTypeSensor+"'")
		}
	}
	return len(failures) == 0, failures
}

func (f *factory) NewDriver(params map[string]interface{}, _ interface{}) (hal.Driver, error) {
	if valid, failures := f.ValidateParameters(params); !valid {
		return nil, errors.New(hal.ToErrorString(failures))
	}
	address := fmt.Sprint(params[paramAddress])
	entityID := fmt.Sprint(params[paramEntityID])
	entityType := fmt.Sprint(params[paramEntityType])

	d := &driver{
		meta:    f.meta,
		address: address,
	}

	switch entityType {
	case entityTypeSwitch:
		d.pin = &switchPin{address: address, entityID: entityID}
	case entityTypeSensor:
		d.sensor = &sensorPin{address: address, entityID: entityID}
	}

	return d, nil
}

// driver implements hal.Driver for an ESPHome device.
type driver struct {
	meta    hal.Metadata
	address string
	pin     *switchPin
	sensor  *sensorPin
}

func (d *driver) Metadata() hal.Metadata { return d.meta }
func (d *driver) Close() error           { return nil }

func (d *driver) Pins(cap hal.Capability) ([]hal.Pin, error) {
	switch cap {
	case hal.DigitalOutput:
		if d.pin != nil {
			return []hal.Pin{d.pin}, nil
		}
		return nil, errors.New("esphome: driver not configured as switch")
	case hal.AnalogInput:
		if d.sensor != nil {
			return []hal.Pin{d.sensor}, nil
		}
		return nil, errors.New("esphome: driver not configured as sensor")
	default:
		return nil, fmt.Errorf("unsupported capability: %s", cap.String())
	}
}

func (d *driver) DigitalOutputPins() []hal.DigitalOutputPin {
	if d.pin != nil {
		return []hal.DigitalOutputPin{d.pin}
	}
	return nil
}

func (d *driver) DigitalOutputPin(n int) (hal.DigitalOutputPin, error) {
	if n != 0 || d.pin == nil {
		return nil, fmt.Errorf("esphome: pin %d not available", n)
	}
	return d.pin, nil
}

func (d *driver) AnalogInputPins() []hal.AnalogInputPin {
	if d.sensor != nil {
		return []hal.AnalogInputPin{d.sensor}
	}
	return nil
}

func (d *driver) AnalogInputPin(n int) (hal.AnalogInputPin, error) {
	if n != 0 || d.sensor == nil {
		return nil, fmt.Errorf("esphome: analog pin %d not available", n)
	}
	return d.sensor, nil
}

// httpClient is a shared HTTP client with a reasonable timeout.
var httpClient = &http.Client{Timeout: 5 * time.Second}

// entityState matches the ESPHome native REST API entity response.
type entityState struct {
	ID    string  `json:"id"`
	State string  `json:"state"` // "ON" or "OFF" for switches
	Value float64 `json:"value"` // numeric value for sensors
}

// fetchEntityState queries GET http://<address>/ and finds the entity by ID.
// ESPHome returns a JSON array of all entities; we match by exact ID or by
// the prefixed form "switch-<id>" / "sensor-<id>".
func fetchEntityState(address, entityID string) (entityState, error) {
	url := fmt.Sprintf("http://%s/", address)
	resp, err := httpClient.Get(url)
	if err != nil {
		return entityState{}, fmt.Errorf("esphome: GET %s: %w", url, err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return entityState{}, err
	}
	var entities []entityState
	if err := json.Unmarshal(body, &entities); err != nil {
		return entityState{}, fmt.Errorf("esphome: parse entities: %w", err)
	}
	for _, e := range entities {
		if e.ID == entityID ||
			e.ID == "switch-"+entityID ||
			e.ID == "sensor-"+entityID {
			return e, nil
		}
	}
	return entityState{}, fmt.Errorf("esphome: entity %q not found", entityID)
}

// switchPin controls an ESPHome switch entity.
// It implements hal.DigitalOutputPin.
type switchPin struct {
	address  string
	entityID string
}

func (p *switchPin) Name() string { return p.entityID }
func (p *switchPin) Number() int  { return 0 }
func (p *switchPin) Close() error { return nil }

func (p *switchPin) LastState() bool {
	e, err := fetchEntityState(p.address, p.entityID)
	if err != nil {
		return false
	}
	return e.State == "ON"
}

func (p *switchPin) Write(on bool) error {
	action := "turn_off"
	if on {
		action = "turn_on"
	}
	url := fmt.Sprintf("http://%s/switch/%s/%s", p.address, p.entityID, action)
	resp, err := httpClient.Post(url, "application/json", nil)
	if err != nil {
		return fmt.Errorf("esphome: POST %s: %w", url, err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("esphome: HTTP %d: %s", resp.StatusCode, body)
	}
	return nil
}

// sensorPin reads an ESPHome sensor entity.
// It implements hal.AnalogInputPin.
type sensorPin struct {
	address      string
	entityID     string
	measurements []hal.Measurement
}

func (s *sensorPin) Name() string { return s.entityID }
func (s *sensorPin) Number() int  { return 0 }
func (s *sensorPin) Close() error { return nil }

// Value returns the raw sensor reading.
func (s *sensorPin) Value() (float64, error) {
	e, err := fetchEntityState(s.address, s.entityID)
	if err != nil {
		return 0, err
	}
	return e.Value, nil
}

// Calibrate stores calibration measurements for future use in Measure().
func (s *sensorPin) Calibrate(ms []hal.Measurement) error {
	s.measurements = ms
	return nil
}

// Measure returns the calibrated sensor reading.
// If no calibration has been set, it returns the raw value.
func (s *sensorPin) Measure() (float64, error) {
	raw, err := s.Value()
	if err != nil {
		return 0, err
	}
	if len(s.measurements) == 0 {
		return raw, nil
	}
	cal, err := hal.CalibratorFactory(s.measurements)
	if err != nil {
		return 0, fmt.Errorf("esphome: calibration: %w", err)
	}
	return cal.Calibrate(raw), nil
}
