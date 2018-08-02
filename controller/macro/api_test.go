package macro

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

type mockSubsystem struct{}

func (m *mockSubsystem) Setup() error              { return nil }
func (m *mockSubsystem) LoadAPI(r *mux.Router)     {}
func (m *mockSubsystem) Start()                    {}
func (m *mockSubsystem) Stop()                     {}
func (m *mockSubsystem) On(_ string, _ bool) error { return nil }

type mockController struct{}

func (m *mockController) Subsystem(s string) (types.Subsystem, error) {
	return new(mockSubsystem), nil
}

func TestSubsystem(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	telemetry := utils.TestTelemetry()
	_, err = New(true, new(mockController), store, telemetry)
	if err != nil {
		t.Fatal(err)
	}
}
