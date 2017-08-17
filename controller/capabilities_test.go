package controller

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func Test_Capabilities(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/capabilities", strings.NewReader("{}"))
	if err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()
	router := mux.NewRouter()
	r := &ReefPi{}
	cpas := r.Capabilities()
	if len(cpas) != 0 {
		t.Fatal(cpas)
	}
	r.loadAPI(router)
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatal(rr.Code)
	}
	var resp []string
	if err := json.Unmarshal([]byte(rr.Body.String()), &resp); err != nil {
		t.Fatal(err)
	}
}
