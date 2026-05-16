package ato

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func setupATOController(t *testing.T) (*Controller, *utils.TestRouter) {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	drvrs := drivers.TestDrivers(con.Store())
	outlets := connectors.NewOutlets(drvrs, con.Store())
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	inlets := connectors.NewInlets(drvrs, con.Store())
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(con)
	if err := eqs.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := outlets.Create(connectors.Outlet{Name: "ato-outlet", Pin: 21, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	if err := eqs.Create(equipment.Equipment{Outlet: "1"}); err != nil {
		t.Fatal(err)
	}
	if err := inlets.Create(connectors.Inlet{Name: "ato-sensor", Pin: 16, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	return c, tr
}

func TestATOEntityMethods(t *testing.T) {
	a := ATO{Name: "MyATO"}
	if got := a.EName(); got != "MyATO" {
		t.Errorf("EName() = %q, want %q", got, "MyATO")
	}
	if _, err := a.Status(); err != nil {
		t.Error("Status() should not error:", err)
	}
}

func TestATOCreateFeed(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	a := ATO{Name: "FeedTest", Enable: true, Pump: "1"}
	// CreateFeed should not panic
	a.CreateFeed(con.Telemetry())

	// disabled ATO — no feeds created (no panic)
	a2 := ATO{Name: "FeedTest2", Enable: false}
	a2.CreateFeed(con.Telemetry())
}

func TestATOInUse(t *testing.T) {
	c, tr := setupATOController(t)

	a := ATO{Name: "InUseTest", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: false}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(a)
	if err := tr.Do("PUT", "/api/atos", body, nil); err != nil {
		t.Fatal("Failed to create ato:", err)
	}

	tests := []struct {
		name    string
		depType string
		wantLen int
		wantErr bool
	}{
		{name: "equipment", depType: "equipment", wantLen: 1},
		{name: "inlet", depType: "inlets", wantLen: 1},
		{name: "macro", depType: "macro", wantLen: 0},
		{name: "unknown", depType: "unknown", wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			deps, err := c.InUse(tt.depType, "1")
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error for dependency type %q", tt.depType)
				}
				return
			}
			if err != nil {
				t.Fatalf("InUse(%s) error: %v", tt.depType, err)
			}
			if len(deps) != tt.wantLen {
				t.Fatalf("InUse(%s) returned %d deps, want %d", tt.depType, len(deps), tt.wantLen)
			}
		})
	}
}

func TestATOReset(t *testing.T) {
	_, tr := setupATOController(t)

	a := ATO{Name: "ResetTest", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: false}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(a)
	if err := tr.Do("PUT", "/api/atos", body, nil); err != nil {
		t.Fatal("Failed to create ato:", err)
	}

	if err := tr.Do("POST", "/api/atos/1/reset", new(bytes.Buffer), nil); err != nil {
		t.Error("Reset via API should not fail:", err)
	}
}

func TestATOGetEntity(t *testing.T) {
	c, _ := setupATOController(t)

	a := ATO{Name: "EntityTest", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: false}
	if err := c.Create(a); err != nil {
		t.Fatal("Failed to create ato:", err)
	}

	entity, err := c.GetEntity("1")
	if err != nil {
		t.Fatal(err)
	}
	if entity.EName() != "EntityTest" {
		t.Fatalf("expected entity name EntityTest, got %q", entity.EName())
	}
}

func TestATONotifyIfNeeded(t *testing.T) {
	c, _ := setupATOController(t)

	// Control=false, Notify.Enable=false: should be a no-op
	a := ATO{Name: "notify-test", Control: false, Notify: Notify{Enable: false}}
	c.NotifyIfNeeded(a, 0)

	// Control=false, Notify.Enable=true, reading=0: should send alert
	a.Notify.Enable = true
	c.NotifyIfNeeded(a, 0)

	// Control=false, Notify.Enable=true, reading=1: no alert
	c.NotifyIfNeeded(a, 1)
}
