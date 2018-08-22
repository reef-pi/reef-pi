package macro

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestStep(t *testing.T) {
	s := Step{
		Type:   "equipment",
		Config: []byte("{}"),
	}
	c, err := utils.TestController()
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Run(c); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c); err == nil {
		t.Error("Equipment step with invalid config should raise error")
	}

	s.Type = "foo"
	s.Config = []byte(`{}`)
	if err := s.Run(c); err == nil {
		t.Error("Unknown type should raise error")
	}
	s.Type = "wait"
	if err := s.Run(c); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c); err == nil {
		t.Error("Invalid wait step config should raise error")
	}

	s.Type = "subsystem"
	s.Config = []byte(`{ "on": true}`)
	if err := s.Run(c); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`{ "on": false}`)
	if err := s.Run(c); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(c); err == nil {
		t.Error("Invalid subsystem system config should raise error")
	}
}
