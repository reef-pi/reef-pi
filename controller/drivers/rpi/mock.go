package rpi

import "github.com/kidoman/embd"

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
