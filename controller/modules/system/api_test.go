package system

import (
	"io/ioutil"
	"os"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestSystemController(t *testing.T) {
	t.Parallel()
	config := Config{
		DevMode:   true,
		Name:      "test-system",
		Interface: "lo0",
		Pprof:     true,
	}
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	c := New(config, con)
	c.Setup()
	c.Start()
	c.Stop()

	if err := c.enableDisplay(); err != nil {
		t.Fatal("Failed to enable display:", err)
	}
	if err := c.disableDisplay(); err != nil {
		t.Fatal("Failed to disable display:", err)
	}
	if _, err := c.currentDisplayState(); err != nil {
		t.Fatal("Failed to get display state:", err)
	}
	if err := c.setBrightness(0); err != nil {
		t.Fatal("Failed to set display brightness:", err)
	}

	c.SystemPoweroff()
	c.SystemReboot()
	if err := c.SystemReload(); err != nil {
		t.Fatal("Failed to reload system:", err)
	}

	_ = c.ComputeSummary()

	if _, err := c.lastStartTime(); err != nil {
		t.Error(err)
	}
	if _, err := c.currentDisplayState(); err != nil {
		t.Error(err)
	}
	if _, err := c.getBrightness(); err != nil {
		t.Error(err)
	}
	c.lastStopTime()
	f, err := ioutil.TempFile("", "reef-pi-testing")
	if err != nil {
		t.Fatal("Failed to create tempfile", err)
	}
	defer os.Remove(f.Name())
	c.PowerFile = f.Name()
	c.BrightnessFile = f.Name()
	f.Write([]byte("1"))
	_, err = c.currentDisplayState()
	if err != nil {
		t.Error(err)
	}
	if err := c.enableDisplay(); err != nil {
		t.Error(err)
	}
	if err := c.disableDisplay(); err != nil {
		t.Error(err)
	}
	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	c.config.DevMode = false
	if _, err := c.currentDisplayState(); err != nil {
		t.Error(err)
	}
	if err := c.enableDisplay(); err != nil {
		t.Error(err)
	}
	if err := c.disableDisplay(); err != nil {
		t.Error(err)
	}

	// InUse always returns empty
	deps, err := c.InUse("equipment", "1")
	if err != nil {
		t.Error("InUse should not error:", err)
	}
	if len(deps) != 0 {
		t.Error("Expected empty deps from system InUse")
	}

	// GetEntity is not supported
	if _, err := c.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}
