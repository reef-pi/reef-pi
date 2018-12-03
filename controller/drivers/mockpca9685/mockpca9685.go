package mockpca9685

import (
	"fmt"
	"log"
	"sort"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
)

type mockPwmChannel struct {
	name string
}

func (m *mockPwmChannel) Name() string    { return m.name }
func (m *mockPwmChannel) Close() error    { return nil }
func (m *mockPwmChannel) LastState() bool { return false }

func (m *mockPwmChannel) Set(value float64) error {
	log.Printf("mockpca9685: setting pwm %s to %f", m.name, value)
	return nil
}

func (m *mockPwmChannel) Write(on bool) error {
	if on {
		return m.Set(100)
	}
	return m.Set(0)
}

type mockDriver struct {
	channels map[string]*mockPwmChannel
}

func (m *mockDriver) Close() error { return nil }

func (m *mockDriver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "pca9685",
		Description: "Mock driver - no actual hardware",
		Capabilities: driver.Capabilities{
			PWM:    true,
			Output: true,
		},
	}
}

func (m *mockDriver) PWMChannels() []driver.PWMChannel {
	var chs []driver.PWMChannel
	for _, ch := range m.channels {
		chs = append(chs, ch)
	}
	sort.Slice(chs, func(i, j int) bool { return chs[i].Name() < chs[j].Name() })
	return chs
}

func (m *mockDriver) OutputPins() []driver.OutputPin {
	var chs []driver.OutputPin
	for _, ch := range m.channels {
		chs = append(chs, ch)
	}
	sort.Slice(chs, func(i, j int) bool { return chs[i].Name() < chs[j].Name() })
	return chs
}

func (m *mockDriver) GetOutputPin(name string) (driver.OutputPin, error) {
	pin, ok := m.channels[name]
	if !ok {
		return nil, fmt.Errorf("unknown pin with name %s", name)
	}
	return pin, nil
}

func NewMockDriver(s settings.Settings) (driver.Driver, error) {
	return &mockDriver{
		channels: map[string]*mockPwmChannel{
			"1": {
				name: "1",
			},
			"2": {
				name: "2",
			},
		},
	}, nil
}
