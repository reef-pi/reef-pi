package controller

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func Test_Info(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/info", strings.NewReader("{}"))
	if err != nil {
		t.Fatal(err)
	}
	config := Config{
		Interface: "lo0",
	}
	c, err := New(config)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.CreateBuckets(); err != nil {
		t.Fatal(err)
	}
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
