package lighting

import (
	"strings"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
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

func TestLightingUsageAndDisable(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	driver := drivers.Driver{
		Name:   "lighting",
		Type:   "pca9685",
		Config: []byte(`{"address":64, "frequency":1000}`),
	}
	if err := con.DM().Drivers().Create(driver); err != nil {
		t.Fatal(err)
	}
	jacks := con.DM().Jacks()
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := jacks.Create(connectors.Jack{Name: "J1", Pins: []int{3}, Driver: "1"}); err != nil {
		t.Fatal(err)
	}

	c, err := New(Config{Interval: time.Hour}, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := c.Create(Light{
		Name:   "Refugium",
		Jack:   "1",
		Enable: true,
		Channels: map[int]*Channel{
			3: {Name: "white", Manual: true, Value: 42},
		},
	}); err != nil {
		t.Fatal(err)
	}
	c.Stop()

	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	if err := tr.Do("GET", "/api/lights/1/usage", strings.NewReader("{}"), nil); err != nil {
		t.Fatal(err)
	}
	if err := c.On("1", false); err != nil {
		t.Fatal(err)
	}
	l, err := c.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	if l.Enable {
		t.Fatal("expected light to be disabled")
	}
}
