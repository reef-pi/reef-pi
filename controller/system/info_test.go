package system

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func testController() (*Controller, error) {
	config := Config{
		Interface: "lo0",
		Name:      "reef-pi",
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
	req, err := http.NewRequest("GET", "/api/info", strings.NewReader("{}"))
	if err != nil {
		t.Fatal(err)
	}
	c, err := testController()
	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	c.LoadAPI(router)
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatal(rr.Code)
	}
	var resp Summary
	if err := json.Unmarshal([]byte(rr.Body.String()), &resp); err != nil {
		t.Fatal(err)
	}
}
