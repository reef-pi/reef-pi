package api

import (
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller"
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test_Info(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/info", nil)
	if err != nil {
		t.Fatal(err)
	}
	c, err := controller.New(controller.DefaultConfig)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.CreateBuckets(); err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()
	config := ServerConfig{
		Interface: "lo0",
	}
	h := NewApiHandler(c, config)
	h.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatal(rr.Code)
	}
	var resp Info
	if err := json.Unmarshal([]byte(rr.Body.String()), &resp); err != nil {
		t.Fatal(err)
	}
}
