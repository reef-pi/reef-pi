package rpi

import (
	"errors"

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

	setting  [2]int
	freq     [2]int
	exported [2]bool
	enabled  [2]bool
}

func (m *mockPwmDriver) IsExported(ch int) (bool, error) { return m.exported[ch], nil }
func (m *mockPwmDriver) Export(ch int) error {
	if m.exported[ch] {
		return errors.New("already exported")
	}
	m.exported[ch] = true
	return nil
}
func (m *mockPwmDriver) DutyCycle(ch, duty int) error   { m.setting[ch] = duty; return nil }
func (m *mockPwmDriver) Frequency(ch, freq int) error   { m.freq[ch] = freq; return nil }
func (m *mockPwmDriver) Enable(ch int) error            { m.enabled[ch] = true; return nil }
func (m *mockPwmDriver) IsEnabled(ch int) (bool, error) { return m.enabled[ch], nil }

func newMockPWMDriver() pwm.Driver {
	return &mockPwmDriver{}
}
