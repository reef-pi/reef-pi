package mock

import (
	"fmt"
	"log"

	"github.com/pkg/errors"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
)

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
	closed bool
	pins   []*mockPin
}

func (m *mockDriver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "rpi",
		Description: "Mock driver - no actual hardware",
		Capabilities: driver.Capabilities{
			Input:  true,
			Output: true,
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

func NewMockDriver(s settings.Settings) (driver.Driver, error) {
	pins := []*mockPin{
		{
			name: "GP1",
		},
		{
			name: "GP2",
		},
		{
			name: "GP21",
		},
		{
			name: "GP16",
		},
	}

	return &mockDriver{pins: pins}, nil
}
