package journal

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

func (s *Subsystem) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/journal/{id}", s.get).Methods("GET")
	r.HandleFunc("/api/journal", s.list).Methods("GET")
	r.HandleFunc("/api/journal", s.create).Methods("PUT")
	r.HandleFunc("/api/journal/{id}", s.update).Methods("POST")
	r.HandleFunc("/api/journal/{id}", s.delete).Methods("DELETE")
	r.HandleFunc("/api/journal/{id}/record", s.record).Methods("POST")
	r.HandleFunc("/api/journal/{id}/usage", s.getUsage).Methods("GET")
}

func (s *Subsystem) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return s.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}
func (s *Subsystem) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return s.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (s *Subsystem) create(w http.ResponseWriter, r *http.Request) {
	var p Parameter
	fn := func() error {
		return s.Create(p)
	}
	utils.JSONCreateResponse(&p, fn, w, r)
}

func (s *Subsystem) update(w http.ResponseWriter, r *http.Request) {
	var p Parameter
	fn := func(id string) error {
		return s.Update(id, p)
	}
	utils.JSONUpdateResponse(&p, fn, w, r)
}

func (s *Subsystem) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return s.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (s *Subsystem) getUsage(w http.ResponseWriter, req *http.Request) {
	dec := func(d json.RawMessage) interface{} {
		var u Entry
		if err := json.Unmarshal(d, &u); err != nil {
			log.Println("ERROR:[journal-subsystem] Failed to unmarshal usage value. ", err)
		}
		return u
	}
	fn := func(id string) (interface{}, error) {
		if !s.statsMgr.IsLoaded(id) {
			if err := s.statsMgr.Load(id, dec); err != nil {
				log.Println("ERROR:[journal-subsystem] Failed to load usage value. ", err)
			}
		}
		return s.statsMgr.Get(id)
	}
	utils.JSONGetResponse(fn, w, req)
}

func (s *Subsystem) record(w http.ResponseWriter, req *http.Request) {
	var e Entry
	fn := func(id string) error {
		return s.AddEntry(id, e)
	}
	utils.JSONUpdateResponse(&e, fn, w, req)
}
