package lighting

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"strings"
	"testing"
	"time"
)

func TestLightingController(t *testing.T) {
	config := DefaultConfig
	config.DevMode = true
	config.Channels["spectrum"] = Channel{}
	config.Interval = 1 * time.Second
	config.Cycle.Enable = true
	config.Cycle.ChannelValues["spectrum"] = []int{0, 0, 0, 0, 0, 12, 13, 13, 10, 0, 10, 20}
	telemetry := utils.TestTelemetry()
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal("Failed to create test database. Error:", err)
	}
	c := New(config, store, telemetry)
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup lighting controller")
	}
	tr := utils.NewTestRouter()
	c.LoadAPI(tr.Router)
	log.Println("Here")
	c.Start()
	time.Sleep(2 * time.Second)
	c.Stop()

	var cycle Cycle
	cycle.Enable = true
	body := new(bytes.Buffer)
	enc := json.NewEncoder(body)
	enc.Encode(cycle)
	if err := tr.Do("POST", "/api/lighting/cycle", body, nil); err != nil {
		t.Fatal("Failed to set lighting cycle using api")
	}
	if err := tr.Do("GET", "/api/lighting/cycle", strings.NewReader("{}"), &cycle); err != nil {
		t.Fatal("Failed to get lighting cycle using api")
	}
	var fixed Fixed
	body = new(bytes.Buffer)
	enc = json.NewEncoder(body)
	enc.Encode(fixed)
	if err := tr.Do("POST", "/api/lighting/fixed", body, nil); err != nil {
		t.Fatal("Failed to set fixed lighting using api")
	}
	if err := tr.Do("GET", "/api/lighting/fixed", strings.NewReader("{}"), &fixed); err != nil {
		t.Fatal("Failed to get fixed lighting using api")
	}
	c.Reconfigure()
}
