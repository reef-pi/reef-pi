package controller

import (
	"sync"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type (
	mockEntity struct {
		name  string
		State bool
	}
	mockSubsystem struct {
		sync.Mutex
		state map[string]*mockEntity
	}

	noopController struct {
		t        telemetry.Telemetry
		s        storage.Store
		logError telemetry.ErrorLogger
		subFn    func(s string) (Subsystem, error)
		dm       *device_manager.DeviceManager
	}
)

func (e *mockEntity) EName() string                { return e.name }
func (e *mockEntity) Status() (interface{}, error) { return e.State, nil }

func (m *mockSubsystem) Setup() error                        { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router)               {}
func (m *mockSubsystem) Start()                              {}
func (m *mockSubsystem) InUse(_, _ string) ([]string, error) { return []string{}, nil }
func (m *mockSubsystem) Stop()                               {}
func (m *mockSubsystem) GetEntity(id string) (Entity, error) { return m.Get(id) }
func (m *mockSubsystem) On(id string, b bool) error {
	e, err := m.Get(id)
	if err != nil {
		return err
	}
	e.State = b
	m.Lock()
	m.state[id] = e
	m.Unlock()
	return nil
}

func (m *mockSubsystem) Get(id string) (*mockEntity, error) {
	return new(mockEntity), nil
}

func NoopSubsystem() *mockSubsystem {
	return &mockSubsystem{
		Mutex: sync.Mutex{},
		state: make(map[string]*mockEntity),
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
	t := telemetry.TestTelemetry(store)
	return &noopController{
		t:        t,
		s:        store,
		logError: logError,
		subFn:    func(_ string) (Subsystem, error) { return NoopSubsystem(), nil },
		dm:       device_manager.New(s, store, t),
	}, nil
}
func (c *noopController) Telemetry() telemetry.Telemetry {
	return c.t
}

func (c *noopController) Store() storage.Store {
	return c.s
}

func (c *noopController) DM() *device_manager.DeviceManager {
	return c.dm
}

func (c *noopController) LogError(id, msg string) error {
	return c.logError(id, msg)
}
func (c *noopController) Subsystem(s string) (Subsystem, error) {
	return c.subFn(s)
}
