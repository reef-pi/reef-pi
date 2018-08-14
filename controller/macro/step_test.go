package macro

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/types"
	"testing"
)

type ms struct{}                        // mock sybsystem
func (m *ms) Setup() error              { return nil }
func (m *ms) LoadAPI(_ *mux.Router)     {}
func (m *ms) Start()                    {}
func (m *ms) Stop()                     {}
func (m *ms) On(_ string, _ bool) error { return nil }

type mc struct{}

func (m *mc) Subsystem(_ string) (types.Subsystem, error) {
	return new(ms), nil
}

func TestStep(t *testing.T) {
	s := Step{
		Type:   "equipment",
		Config: []byte("{}"),
	}
	if err := s.Run(new(mc)); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(new(mc)); err == nil {
		t.Error("Equipment step with invalid config should raise error")
	}

	s.Type = "foo"
	s.Config = []byte(`{}`)
	if err := s.Run(new(mc)); err == nil {
		t.Error("Unknown type should raise error")
	}
	s.Type = "wait"
	if err := s.Run(new(mc)); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(new(mc)); err == nil {
		t.Error("Invalid wait step config should raise error")
	}

	s.Type = "subsystem"
	s.Config = []byte(`{ "on": true}`)
	if err := s.Run(new(mc)); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`{ "on": false}`)
	if err := s.Run(new(mc)); err != nil {
		t.Error(err)
	}
	s.Config = []byte(`[]`)
	if err := s.Run(new(mc)); err == nil {
		t.Error("Invalid subsystem system config should raise error")
	}
}
