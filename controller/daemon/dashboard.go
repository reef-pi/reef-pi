package daemon

import (
	"log"
	"net/http"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

//swagger:model dashboard
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
	GridDetails: [][]Chart{{{
		Type: "health",
	}}},
	Column: 1,
	Row:    1,
	Height: 300,
	Width:  500,
}

func loadDashboard(store storage.Store) (Dashboard, error) {
	return newDashboardRepository(store).Get()
}

func initializeDashboard(store storage.Store) (Dashboard, error) {
	if err := newDashboardRepository(store).Setup(); err != nil {
		log.Println("ERROR:Failed to create bucket:", Bucket, ". Error:", err)
		return DefaultDashboard, err
	}
	return DefaultDashboard, nil
}

func (r *ReefPi) GetDashboard(w http.ResponseWriter, req *http.Request) {
	repo := newDashboardRepository(r.store)
	fn := func(_ string) (interface{}, error) {
		return repo.Get()
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) UpdateDashboard(w http.ResponseWriter, req *http.Request) {
	var d Dashboard
	repo := newDashboardRepository(r.store)
	fn := func(_ string) error {
		return repo.Update(d)
	}
	utils.JSONUpdateResponse(&d, fn, w, req)
}
