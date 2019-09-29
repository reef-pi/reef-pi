package controller

import (
	"errors"
	"sync"

	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type (
	mockSubsystem struct {
		sync.Mutex
		state map[string]bool
	}

	controller struct {
		t        telemetry.Telemetry
		s        storage.Store
		logError telemetry.ErrorLogger
		subFn    func(s string) (Subsystem, error)
		dm       *device_manager.DeviceManager
	}
)

func (m *mockSubsystem) Setup() error                        { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router)               {}
func (m *mockSubsystem) Start()                              {}
func (m *mockSubsystem) InUse(_, _ string) ([]string, error) { return []string{}, nil }
func (m *mockSubsystem) Stop()                               {}
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
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	return &controller{
		t:        telemetry.TestTelemetry(store),
		s:        store,
		logError: logError,
		subFn:    func(_ string) (Subsystem, error) { return NoopSubsystem(), nil },
		dm:       device_manager.New(s, store),
	}, nil
}
func (c *controller) Telemetry() telemetry.Telemetry {
	return c.t
}

func (c *controller) Store() storage.Store {
	return c.s
}

func (c *controller) DM() *device_manager.DeviceManager {
	return c.dm
}

func (c *controller) LogError(id, msg string) error {
	return c.logError(id, msg)
}
func (c *controller) Subsystem(s string) (Subsystem, error) {
	return c.subFn(s)
}
