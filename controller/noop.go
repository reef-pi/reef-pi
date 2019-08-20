package controller

import (
	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type mockSubsystem struct{}

func (m *mockSubsystem) Setup() error              { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router)     {}
func (m *mockSubsystem) Start()                    {}
func (m *mockSubsystem) Stop()                     {}
func (m *mockSubsystem) On(_ string, _ bool) error { return nil }
func NoopSubsystem() Subsystem {
	return &mockSubsystem{}
}

func TestController() (Controller, error) {
	store, err := storage.TestDB()
	if err != nil {
		return nil, err
	}
	logError := func(_, _ string) error { return nil }
	subFn := func(_ string) (Subsystem, error) { return new(mockSubsystem), nil }
	return NewController(telemetry.TestTelemetry(store), store, logError, subFn), nil
}
