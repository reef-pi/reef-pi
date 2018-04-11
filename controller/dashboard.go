package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

type Dashboard struct {
	Column      int       `json:"column"`
	Row         int       `json:"row"`
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	GridDetails [][]Chart `json:"grid_details"`
}

type Chart struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

var DefaultDashboard = Dashboard{
	GridDetails: [][]Chart{[]Chart{Chart{
		Type: "health",
	}}},
	Column: 1,
	Row:    1,
	Height: 300,
	Width:  500,
}

func loadDashboard(store utils.Store) (Dashboard, error) {
	var d Dashboard
	if err := store.Get(Bucket, "dashboard", &d); err != nil {
		return d, err
	}
	return d, nil
}

func initializeDashboard(store utils.Store) (Dashboard, error) {
	if err := store.CreateBucket(Bucket); err != nil {
		log.Println("ERROR:Failed to create bucket:", Bucket, ". Error:", err)
		return DefaultDashboard, err
	}
	return DefaultDashboard, store.Update(Bucket, "dashboard", DefaultDashboard)
}

func (r *ReefPi) GetDashboard(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return loadDashboard(r.store)
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) UpdateDashboard(w http.ResponseWriter, req *http.Request) {
	var d Dashboard
	fn := func(_ string) error {
		return r.store.Update(Bucket, "dashboard", d)
	}
	utils.JSONUpdateResponse(&d, fn, w, req)
}
