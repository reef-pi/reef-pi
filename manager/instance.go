package manager

import (
	"encoding/json"
	"net/http"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"

	"log"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

const (
	InstancesBucket = "instances"
)

//swagger:model instance
type Instance struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Addr        string `json:"address"`
	User        string `json:"user"`
	Password    string `json:"password"`
	IgnoreHTTPS bool   `json:"ignore_https"`
}

type instances struct {
	store storage.Store
	tele  telemetry.Telemetry
}

func (i instances) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/instances", i.list).Methods("GET")
	r.HandleFunc("/api/instances/{id}", i.get).Methods("GET")
	r.HandleFunc("/api/instances", i.create).Methods("PUT")
	r.HandleFunc("/api/instances/{id}", i.delete).Methods("DELETE")
	r.HandleFunc("/api/instances/{id}", i.update).Methods("POST")
}
func (i *instances) list(w http.ResponseWriter, r *http.Request) {
	log.Println("Listing instances")
	fn := func() (interface{}, error) {
		ds, err := i.List()
		return ds, err
	}
	utils.JSONListResponse(fn, w, r)
}

func (i *instances) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return i.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (is *instances) update(w http.ResponseWriter, r *http.Request) {
	var i Instance
	fn := func(id string) error {
		return is.Update(id, i)
	}
	utils.JSONUpdateResponse(&i, fn, w, r)
}

func (is *instances) create(w http.ResponseWriter, r *http.Request) {
	var i Instance
	fn := func() error {
		return is.Create(i)
	}
	utils.JSONCreateResponse(&i, fn, w, r)
}

func (i *instances) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return i.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (is *instances) Get(id string) (Instance, error) {
	var i Instance
	return i, is.store.Get(InstancesBucket, id, &i)
}

func (is *instances) List() ([]Instance, error) {
	ii := []Instance{}
	fn := func(_ string, v []byte) error {
		var i Instance
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		ii = append(ii, i)
		return nil
	}
	return ii, is.store.List(InstancesBucket, fn)
}

func (is *instances) Create(i Instance) error {
	fn := func(id string) interface{} {
		i.ID = id
		return &i
	}
	return is.store.Create(InstancesBucket, fn)
}

func (is *instances) Update(id string, i Instance) error {
	i.ID = id
	return is.store.Update(InstancesBucket, id, i)
}

func (is *instances) Delete(id string) error {
	return is.store.Delete(InstancesBucket, id)
}
