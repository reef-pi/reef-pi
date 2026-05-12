package ds18b20

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/reef-pi/hal"
)

const w1Base = "/sys/bus/w1/devices"
const deviceParam = "Device"

type factory struct {
	meta       hal.Metadata
	parameters []hal.ConfigParameter
}

var f *factory
var once sync.Once

// Factory returns a singleton DS18B20 driver factory.
func Factory() hal.DriverFactory {
	once.Do(func() {
		f = &factory{
			meta: hal.Metadata{
				Name:         "ds18b20",
				Description:  "DS18B20 1-wire temperature sensor",
				Capabilities: []hal.Capability{hal.AnalogInput},
			},
			parameters: []hal.ConfigParameter{
				{
					Name:    deviceParam,
					Type:    hal.String,
					Order:   0,
					Default: "28-",
				},
			},
		}
	})
	return f
}

func (f *factory) Metadata() hal.Metadata {
	return f.meta
}

func (f *factory) GetParameters() []hal.ConfigParameter {
	return f.parameters
}

func (f *factory) ValidateParameters(parameters map[string]interface{}) (bool, map[string][]string) {
	failures := make(map[string][]string)
	v, ok := parameters[deviceParam]
	if !ok {
		failures[deviceParam] = append(failures[deviceParam], deviceParam+" is required")
		return false, failures
	}
	s, ok := v.(string)
	if !ok || s == "" {
		failures[deviceParam] = append(failures[deviceParam], deviceParam+" must be a non-empty string")
		return false, failures
	}
	return true, failures
}

func (f *factory) NewDriver(parameters map[string]interface{}, _ interface{}) (hal.Driver, error) {
	if valid, failures := f.ValidateParameters(parameters); !valid {
		return nil, errors.New(hal.ToErrorString(failures))
	}
	device := fmt.Sprint(parameters[deviceParam])
	return &Driver{
		meta:   f.meta,
		device: device,
		ch:     newChannel(device),
	}, nil
}

// Driver implements hal.AnalogInputDriver for a DS18B20 sensor.
type Driver struct {
	meta   hal.Metadata
	device string
	ch     hal.AnalogInputPin
}

func (d *Driver) Metadata() hal.Metadata {
	return d.meta
}

func (d *Driver) Pins(cap hal.Capability) ([]hal.Pin, error) {
	if cap == hal.AnalogInput {
		return []hal.Pin{d.ch}, nil
	}
	return nil, fmt.Errorf("unsupported capability: %s", cap.String())
}

func (d *Driver) AnalogInputPins() []hal.AnalogInputPin {
	return []hal.AnalogInputPin{d.ch}
}

func (d *Driver) AnalogInputPin(n int) (hal.AnalogInputPin, error) {
	if n != 0 {
		return nil, fmt.Errorf("ds18b20 driver has only one channel (0), requested: %d", n)
	}
	return d.ch, nil
}

func (d *Driver) Close() error {
	return nil
}

// channel implements hal.AnalogInputPin reading from the 1-wire sysfs interface.
type channel struct {
	device     string
	calibrator hal.Calibrator
}

func newChannel(device string) hal.AnalogInputPin {
	cal, _ := hal.CalibratorFactory([]hal.Measurement{})
	return &channel{
		device:     device,
		calibrator: cal,
	}
}

func (c *channel) Name() string { return "temperature" }
func (c *channel) Number() int  { return 0 }
func (c *channel) Close() error { return nil }

func (c *channel) Calibrate(points []hal.Measurement) error {
	cal, err := hal.CalibratorFactory(points)
	if err != nil {
		return err
	}
	c.calibrator = cal
	return nil
}

func (c *channel) Value() (float64, error) {
	path := filepath.Join(w1Base, c.device, "w1_slave")
	f, err := os.Open(path)
	if err != nil {
		return 0, fmt.Errorf("ds18b20: failed to open %s: %w", path, err)
	}
	defer f.Close()
	return readTemp(f)
}

func (c *channel) Measure() (float64, error) {
	v, err := c.Value()
	if err != nil {
		return 0, err
	}
	if c.calibrator == nil {
		return v, nil
	}
	return c.calibrator.Calibrate(v), nil
}

func readTemp(r io.Reader) (float64, error) {
	reader := bufio.NewReader(r)
	l1, _, err := reader.ReadLine()
	if err != nil {
		return 0, err
	}
	if !strings.HasSuffix(string(l1), "YES") {
		return 0, fmt.Errorf("ds18b20: first line does not end with YES")
	}
	l2, _, err := reader.ReadLine()
	if err != nil {
		return 0, err
	}
	parts := strings.Split(string(l2), "=")
	if len(parts) < 2 {
		return 0, fmt.Errorf("ds18b20: malformed second line, no '=' found")
	}
	raw, err := strconv.Atoi(strings.TrimSpace(parts[len(parts)-1]))
	if err != nil {
		return 0, fmt.Errorf("ds18b20: failed to parse temperature value: %w", err)
	}
	temp := float64(raw) / 1000.0
	if temp < -55 || temp > 125 {
		return 0, fmt.Errorf("ds18b20: temperature %v°C out of sensor range [-55, 125]", temp)
	}
	return temp, nil
}
