package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
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
}
