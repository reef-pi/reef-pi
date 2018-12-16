package controller

import "github.com/gorilla/mux"

type mockSubsystem struct{}

func (m *mockSubsystem) Setup() error              { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router)     {}
func (m *mockSubsystem) Start()                    {}
func (m *mockSubsystem) Stop()                     {}
func (m *mockSubsystem) On(_ string, _ bool) error { return nil }

func TestController() (Controller, error) {
	store, err := TestDB()
	if err != nil {
		return nil, err
	}
	logError := func(_, _ string) error { return nil }
	subFn := func(_ string) (Subsystem, error) { return new(mockSubsystem), nil }
	return NewController(TestTelemetry(), store, logError, subFn), nil
}
