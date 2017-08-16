package system

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"strings"
	"testing"
)

func testController() (*Controller, error) {
	config := Config{
		Interface: "lo0",
		Name:      "reef-pi",
		DevMode:   true,
	}
	store, err := utils.NewStore("reef-pi.db")
	if err != nil {
		return nil, err
	}
	store.CreateBucket(Bucket)
	tConfig := utils.AdafruitIO{
		Enable: false,
	}
	telemetry := utils.NewTelemetry(tConfig)
	return New(config, store, telemetry), nil
}

func Test_Info(t *testing.T) {
	tr := utils.NewTestRouter()
	c, err := testController()
	if err != nil {
		t.Fatal(err)
	}
	c.LoadAPI(tr.Router)
	var resp Summary
	if err := tr.Do("GET", "/api/info", strings.NewReader("{}"), &resp); err != nil {
		t.Fatal(err)
	}

}
