package lighting

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

func TestLightingController(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}

	defer func(store storage.Store) {
		err := store.Close()
		if err != nil {
			t.Fatal("Failed to close store. Error:", err)
		}
	}(con.Store())

	if err = con.DM().Outlets().Setup(); err != nil {
		t.Fatal("Failed to setup outlets. Error:", err)
	}

	config := Config{
		Interval: time.Second,
	}

	c, err := New(config, con)
	if err != nil {
		t.Fatal("Failed to create lighting controller. Error:", err)
	}

	if err = c.Setup(); err != nil {
		t.Fatal("Failed to setup lighting controller. Error:", err)
	}

	c.Start()
	c.Stop()
}

func TestLightingInUseAndGetEntity(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	if err := con.DM().Outlets().Setup(); err != nil {
		t.Fatal(err)
	}
	c, err := New(Config{Interval: time.Second}, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}

	// InUse for jack type — no lights yet, should return empty
	deps, err := c.InUse(storage.JackBucket, "j1")
	if err != nil {
		t.Error("InUse(jacks) should not error:", err)
	}
	_ = deps

	// InUse for unknown type — should error
	if _, err := c.InUse("unknown", "x"); err == nil {
		t.Error("Expected error for unknown dep type")
	}

	// GetEntity — not supported
	if _, err := c.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}

func TestLightingUsageRollupBefore(t *testing.T) {
	u1 := Usage{
		Channels: map[string]float64{"ch1": 50.0},
		Time:     telemetry.TeleTime(time.Now().Add(-2 * time.Hour)),
	}
	u2 := Usage{
		Channels: map[string]float64{"ch1": 75.0},
		Time:     telemetry.TeleTime(time.Now()),
	}

	_, _ = u1.Rollup(u2)
	if !u1.Before(u2) {
		t.Error("Expected u1 to be Before u2 (older timestamp)")
	}
	if u2.Before(u1) {
		t.Error("Expected u2.Before(u1) to be false")
	}
}
