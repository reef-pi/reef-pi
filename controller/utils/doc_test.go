package utils

import (
	"net/http"
	"os"
	"testing"

	"github.com/gorilla/mux"
)

func TestAPIDocAndSummarize(t *testing.T) {
	r := mux.NewRouter()
	noop := func(w http.ResponseWriter, r *http.Request) {}
	route := r.HandleFunc("/api/test", noop).Methods("GET")

	type reqBody struct{ Name string }
	type respBody struct{ ID string }

	// First call: registers the doc entry
	APIDoc(route, &reqBody{}, &respBody{})
	// Second call: same path+method — should skip (already registered)
	APIDoc(route, &reqBody{}, &respBody{})

	// SummarizeAPI writes api.txt; clean it up afterwards
	defer os.Remove("api.txt")
	SummarizeAPI()

	if _, err := os.Stat("api.txt"); os.IsNotExist(err) {
		t.Error("Expected api.txt to be created by SummarizeAPI")
	}
}

func TestAPIDocRouteWithNoMethods(t *testing.T) {
	r := mux.NewRouter()
	noop := func(w http.ResponseWriter, r *http.Request) {}
	// A route with no explicit methods — GetMethods returns an error, APIDoc should handle gracefully
	route := r.HandleFunc("/api/nomethod", noop)
	APIDoc(route, nil, nil)
}
