package connectors

import (
	"testing"
)

type noopDriver struct{}

func (n *noopDriver) Export(ch int) error             { return nil }
func (n *noopDriver) Unexport(ch int) error           { return nil }
func (n *noopDriver) DutyCycle(ch, duty int) error    { return nil }
func (n *noopDriver) Frequency(ch, freq int) error    { return nil }
func (n *noopDriver) Enable(ch int) error             { return nil }
func (n *noopDriver) Disable(ch int) error            { return nil }
func (n *noopDriver) IsEnabled(ch int) (bool, error)  { return false, nil }
func (n *noopDriver) IsExported(ch int) (bool, error) { return false, nil }

func TestRPIPWMDriver(t *testing.T) {
	NewRPIPWMDriver(100, false)
	d := &rpiDriver{
		driver: &noopDriver{},
		Freq:   10000000,
	}
	if err := d.Start(); err != nil {
		t.Error(err)
	}
	if err := d.Stop(); err != nil {
		t.Error(err)
	}
	if err := d.Set(1, 20); err != nil {
		t.Error(err)
	}
	if err := d.Set(1, 120); err == nil {
		t.Error("Values above 100 should return error")
	}
	if _, err := d.Get(1); err != nil {
		t.Error(err)
	}
	if err := d.On(1); err != nil {
		t.Error(err)
	}
	if err := d.Off(1); err != nil {
		t.Error(err)
	}
}
