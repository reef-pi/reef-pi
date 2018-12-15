package system

import (
	"bytes"
	"io/ioutil"
	"os"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestSystemController(t *testing.T) {
	config := Config{
		DevMode:   true,
		Name:      "test-system",
		Interface: "lo0",
		Pprof:     true,
	}
	con, err := utils.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	c := New(config, con)
	c.Setup()
	c.Start()
	c.Stop()
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)

	if err := tr.Do("POST", "/api/display/on", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to switch  on display using api")
	}
	if err := tr.Do("POST", "/api/display/off", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to switch  on display using api")
	}
	if err := tr.Do("GET", "/api/display", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to get display brightness using api")
	}
	if err := tr.Do("POST", "/api/display", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("Failed to set display brightness using api")
	}
	if err := tr.Do("POST", "/api/admin/poweroff", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/admin/reboot", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	if err := tr.Do("POST", "/api/admin/reload", new(bytes.Buffer), nil); err != nil {
		t.Fatal(err)
	}
	var resp Summary
	if err := tr.Do("GET", "/api/info", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal(err)
	}
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
}
