package controller

import (
	"testing"
)

func TestSubsystem(t *testing.T) {
	c, err := TestController()
	defer c.Store().Close()

	if err != nil {
		t.Error(err)
	}
	s := NoopSubsystem()
	if err := s.On("1", true); err != nil {
		t.Error(err)
	}
	if _, err := c.Telemetry().Alert("Test", "Alert"); err != nil {
		t.Error(err)
	}
}
