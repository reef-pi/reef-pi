package mockrpi

import (
	"errors"
	"fmt"
	"log"
	"sort"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/types/driver"
)

var (
	validGPIOPins = map[int]bool{
		2:  true,
		3:  true,
		4:  true,
		5:  true,
		6:  true,
		7:  true,
		8:  true,
		9:  true,
		10: true,
		11: true,
		12: true,
		13: true,
		14: true,
		15: true,
		16: true,
		17: true,
		18: true,
		19: true,
		20: true,
		21: true,
		22: true,
		23: true,
		24: true,
		25: true,
		26: true,
		27: true,
	}
)

type mockPwmChannel struct {
	name string
}

func (m *mockPwmChannel) Name() string    { return m.name }
func (m *mockPwmChannel) Close() error    { return nil }
func (m *mockPwmChannel) LastState() bool { return false }

func (m *mockPwmChannel) Set(value float64) error {
	if value < 0 || value > 100 {
		return fmt.Errorf("invalud pwm value %f", value)
	}
	log.Printf("mockpca9685: setting pwm %s to %f", m.name, value)
	return nil
}

func (m *mockPwmChannel) Write(on bool) error {
	if on {
		return m.Set(100)
	}
	return m.Set(0)
}

type mockPin struct {
	name   string
	state  bool
	closed bool
}

func (m *mockPin) Close() error {
	m.closed = true
	return nil
}

func (m *mockPin) Name() string { return m.name }
func (m *mockPin) Read() (bool, error) {
	log.Printf("mock: read %s value %v", m.name, m.state)
	return m.state, nil
}
func (m *mockPin) Write(state bool) error {
	log.Printf("mock: write %s value %v", m.name, m.state)
	m.state = state
	return nil
}
func (m *mockPin) LastState() bool { return m.state }

type mockDriver struct {
	closed   bool
	pins     []*mockPin
	channels []*mockPwmChannel
}

func (m *mockDriver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "rpi",
		Description: "Mock driver - no actual hardware",
		Capabilities: driver.Capabilities{
			Input:  true,
			Output: true,
			PWM:    true,
		},
	}
}

func (m *mockDriver) Close() error {
	m.closed = true
	return nil
}

func (m *mockDriver) InputPins() []driver.InputPin {
	var pins []driver.InputPin
	for _, p := range m.pins {
		pins = append(pins, p)
	}
	return pins
}

func (m *mockDriver) GetInputPin(name string) (driver.InputPin, error) {
	for _, pin := range m.pins {
		if pin.name == name {
			return pin, nil
		}
	}
	return nil, fmt.Errorf("unknown input pin specified %s", name)
}

func (m *mockDriver) OutputPins() []driver.OutputPin {
	var pins []driver.OutputPin
	for _, p := range m.pins {
		pins = append(pins, p)
	}
	return pins
}

func (m *mockDriver) GetOutputPin(name string) (driver.OutputPin, error) {
	for _, pin := range m.pins {
		if pin.name == name {
			return pin, nil
		}
	}
	return nil, errors.New("unknown output pin specified")
}

func (m *mockDriver) PWMChannels() []driver.PWMChannel {
	var chs []driver.PWMChannel
	for _, ch := range m.channels {
		chs = append(chs, ch)
	}
	sort.Slice(chs, func(i, j int) bool { return chs[i].Name() < chs[j].Name() })
	return chs
}

func (m *mockDriver) GetPWMChannel(name string) (driver.PWMChannel, error) {
	for _, ch := range m.channels {
		if ch.name == name {
			return ch, nil
		}
	}
	return nil, fmt.Errorf("no channel named %s", name)
}

func NewMockDriver(s settings.Settings, b i2c.Bus) (driver.Driver, error) {
	var pins []*mockPin
	for pin, _ := range validGPIOPins {
		pins = append(pins, &mockPin{name: fmt.Sprintf("GP%d", pin)})
	}
	chs := []*mockPwmChannel{
		{
			name: "0",
		},
		{
			name: "1",
		},
	}

	return &mockDriver{
		pins:     pins,
		channels: chs,
	}, nil
}
