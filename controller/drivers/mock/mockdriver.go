package mock

import (
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
)

type mockDriver struct {
	closed bool
}

func (m *mockDriver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "mock",
		Description: "Mock driver - no actual hardware",
		Capabilities: driver.Capabilities{
			Input:  false,
			Output: false,
		},
	}
}

func (m *mockDriver) Close() error {
	m.closed = true
	return nil
}

func NewMockDriver(s settings.Settings) (driver.Driver, error) {
	return &mockDriver{}, nil
}
