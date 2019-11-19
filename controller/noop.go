package controller

import (
	"errors"
	"github.com/gorilla/mux"
	"sync"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type mockSubsystem struct {
	sync.Mutex
	state map[string]bool
}

func (m *mockSubsystem) Setup() error          { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router) {}
func (m *mockSubsystem) Start()                {}
func (m *mockSubsystem) Stop()                 {}
func (m *mockSubsystem) On(id string, b bool) error {
	m.Lock()
	defer m.Unlock()
	m.state[id] = b
	return nil
}

func (m *mockSubsystem) Get(id string) (bool, error) {
	b, ok := m.state[id]
	if ok {
		return b, nil
	}
	return false, errors.New("not found")
}

func NoopSubsystem() *mockSubsystem {
	return &mockSubsystem{
		Mutex: sync.Mutex{},
		state: make(map[string]bool),
	}
}

func TestController() (Controller, error) {
	store, err := storage.TestDB()
	if err != nil {
		return nil, err
	}
	logError := func(_, _ string) error { return nil }
	subFn := func(_ string) (Subsystem, error) { return NoopSubsystem(), nil }
	return NewController(telemetry.TestTelemetry(store), store, logError, subFn), nil
}
