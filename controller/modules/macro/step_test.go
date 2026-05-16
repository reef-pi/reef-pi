package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
)

func TestStep(t *testing.T) {
	s := Step{
		Type:   "equipment",
		Config: []byte("{}"),
	}
	c, err := controller.TestController()
	defer c.Store().Close()

	if err != nil {
		t.Fatal(err)
	}
	if err := s.Run(c, false); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c, false); err == nil {
		t.Error("Equipment step with invalid config should raise error")
	}

	s.Type = "foo"
	s.Config = []byte(`{}`)
	if err := s.Run(c, false); err == nil {
		t.Error("Unknown type should raise error")
	}
	s.Type = "wait"
	if err := s.Run(c, false); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c, false); err == nil {
		t.Error("Invalid wait step config should raise error")
	}

	s.Type = "subsystem"
	s.Config = []byte(`{ "on": true}`)
	if err := s.Run(c, false); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`{ "on": false}`)
	if err := s.Run(c, false); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c, false); err == nil {
		t.Error("Invalid subsystem system config should raise error")
	}

	// alert step
	s.Type = "alert"
	s.Config = []byte(`{"title":"Test Alert","message":"test msg"}`)
	if err := s.Run(c, false); err != nil {
		t.Error("Valid alert step should not error:", err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c, false); err == nil {
		t.Error("Invalid alert step config should raise error")
	}

	// reverse flag on equipment step
	s.Type = "equipment"
	s.Config = []byte(`{"id":"1","on":true}`)
	if err := s.Run(c, true); err != nil {
		t.Error("reverse equipment step should not error:", err)
	}
}

func TestStepPWMBranches(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	s := Step{Type: "pwm", Config: []byte(`[]`)}
	if err := s.Run(c, false); err == nil {
		t.Fatal("invalid pwm config should fail")
	}

	jacks := c.DM().Jacks()
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := jacks.Create(connectors.Jack{Name: "macro-jack", Pins: []int{0, 1}, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}

	s.Config = []byte(`{"id":"1","value":33}`)
	if err := s.Run(c, false); err != nil {
		t.Fatal(err)
	}
	s.Config = []byte(`{"id":"missing","value":33}`)
	if err := s.Run(c, false); err == nil {
		t.Fatal("missing pwm jack should fail")
	}
}
