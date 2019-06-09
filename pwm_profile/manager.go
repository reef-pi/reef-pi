package pwm_profile

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
	"net/http"
)

const bucket = storage.PWMProfilesBucket

type Manager struct {
	store storage.Store
}

func (m *Manager) Close() error {
	return nil
}

func (m *Manager) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/pwm_profiles/{id}", m.get).Methods("GET")
	r.HandleFunc("/api/pwm_profiles", m.list).Methods("GET")
	r.HandleFunc("/api/pwm_profiles", m.create).Methods("PUT")
	r.HandleFunc("/api/pwm_profiles/{id}", m.delete).Methods("DELETE")
	r.HandleFunc("/api/pwm_profiles/{id}", m.update).Methods("POST")
}

func NewManager(store storage.Store) (*Manager, error) {
	return &Manager{store: store}, nil
}
func (m *Manager) Setup() error {
	return m.store.CreateBucket(bucket)
}

func (m *Manager) Create(p ProfileSpec) error {
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	return m.store.Create(bucket, fn)
}

func (m *Manager) Update(id string, i ProfileSpec) error {
	i.ID = id
	return m.store.Update(bucket, id, i)
}

func (m *Manager) List() ([]ProfileSpec, error) {
	specs := []ProfileSpec{}
	fn := func(v []byte) error {
		var i ProfileSpec
		if err := json.Unmarshal(v, &i); err != nil {
			return err
		}
		specs = append(specs, i)
		return nil
	}
	return specs, m.store.List(bucket, fn)
}

func (m *Manager) Delete(id string) error {
	return m.store.Delete(bucket, id)
}

func (m *Manager) Get(id string) (ProfileSpec, error) {
	var i ProfileSpec
	return i, m.store.Get(bucket, id, &i)
}

func (c *Manager) get(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Manager) list(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Manager) update(w http.ResponseWriter, r *http.Request) {
	var i ProfileSpec
	fn := func(id string) error {
		return c.Update(id, i)
	}
	utils.JSONUpdateResponse(&i, fn, w, r)
}
func (c *Manager) create(w http.ResponseWriter, r *http.Request) {
	var i ProfileSpec
	fn := func() error {
		return c.Create(i)
	}
	utils.JSONCreateResponse(&i, fn, w, r)
}

func (c *Manager) delete(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) error {
		return c.Delete(id)
	}
	utils.JSONDeleteResponse(fn, w, r)
}
