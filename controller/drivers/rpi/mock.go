package rpi

import (
	"fmt"

	"github.com/kidoman/embd"
	"github.com/reef-pi/rpi/pwm"
)

type mockDigitalPin struct {
	embd.DigitalPin

	direction embd.Direction
	value     int
	closed    bool
}

func (m *mockDigitalPin) SetDirection(dir embd.Direction) error {
	m.direction = dir
	return nil
}

func (m *mockDigitalPin) Read() (int, error) {
	return m.value, nil
}

func (m *mockDigitalPin) Write(n int) error {
	m.value = n
	return nil
}

func (m *mockDigitalPin) Close() error {
	m.closed = true
	return nil
}

func newMockDigitalPin(opt interface{}) (embd.DigitalPin, error) {
	return &mockDigitalPin{}, nil
}

type mockPwmDriver struct {
	pwm.Driver
	setting int
}

func (m *mockPwmDriver) Set(value float64) error {
	if value < 0 || value > 100 {
		return fmt.Errorf("value must be 0-100, got %f", value)
	}
	m.setting = int(value)
	return nil
}

func newMockPWMDriver() pwm.Driver {
	return &mockPwmDriver{}
}
