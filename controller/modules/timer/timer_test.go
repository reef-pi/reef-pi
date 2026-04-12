package timer

import (
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestTimerInUse(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	ctrl := New(c)
	if err := ctrl.Setup(); err != nil {
		t.Fatal(err)
	}

	trigger, _ := json.Marshal(Trigger{ID: "1"})
	j := Job{
		Name:   "EquipTimer",
		Type:   storage.EquipmentBucket,
		Target: trigger,
		Enable: false,
		Second: "0",
		Minute: "*",
		Hour:   "*",
		Day:    "*",
		Month:  "*",
		Week:   "*",
	}
	if err := ctrl.Create(j); err != nil {
		t.Fatal("Create job failed:", err)
	}

	// equipment dep
	deps, err := ctrl.InUse(storage.EquipmentBucket, "1")
	if err != nil {
		t.Error("InUse(equipment) error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected at least one equipment dep")
	}

	// unknown dep type
	if _, err := ctrl.InUse("unknown", "1"); err == nil {
		t.Error("Expected error for unknown dep type")
	}
}

func TestTimerGetEntity(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	ctrl := New(c)
	if _, err := ctrl.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}
