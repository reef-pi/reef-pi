package equipments

import (
	"github.com/gorilla/mux"
)

const EquipmentBucket = "equipments"

type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
	On     bool   `json:"on"`
	Value  int    `json:"value"`
}

func (e *Controller) LoadAPI(r mux.Router) {
	r.HandleFunc("/api/equipments/{id}", e.GetEquipment).Methods("GET")
	r.HandleFunc("/api/equipments", e.ListEquipments).Methods("GET")
	r.HandleFunc("/api/equipments", e.CreateEquipment).Methods("PUT")
	r.HandleFunc("/api/equipments/{id}", e.UpdateEquipment).Methods("POST")
	r.HandleFunc("/api/equipments/{id}", e.DeleteEquipment).Methods("DELETE")
}

func (e *Controller) GetEquipment(w http.ResponseWriter, r *http.Request) {
	var eq Equipment
	fn := func(id string) (interface{}, error) {
		return eq, e.store.Get(EquipmentBucket, id, &eq)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c Controller) ListEquipments(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return .ListEquipments()
	}
	fn := func(id string) (interface{}, error) {
		return c.store.List(EquipmentBucket)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) CreateEquipment(eq Equipment) error {
	fn := func(id string) interface{} {
		eq.ID = id
		return eq
	}
	if err := c.store.Create(EquipmentBucket, fn); err != nil {
		return err
	}
	outlet, ok := c.config.Equipments.Outlets[eq.Outlet]
	if ok {
		if outlet.Equipment != "" {
			return fmt.Errorf("Outlet is %s already used by equipment %s", eq.Outlet, outlet.Equipment)
		}
		outlet.Equipment = eq.Name
		c.config.Equipments.Outlets[eq.Outlet] = outlet
	} else {
		return fmt.Errorf("Outlet named %s not present", eq.Outlet)
	}
	return c.syncOutlet(eq)
}

func (c *Controller) syncOutlet(eq Equipment) error {
	return c.ConfigureOutlet(eq.Outlet, eq.On, eq.Value)
}

func (c *Controller) UpdateEquipment(id string, eq Equipment) error {
	if err := c.store.Update(EquipmentBucket, id, eq); err != nil {
		return err
	}
	eq.ID = id
	return c.syncOutlet(eq)
}

func (c *Controller) DeleteEquipment(id string) error {
	eq, err := c.GetEquipment(id)
	if err != nil {
		return err
	}
	outlet, ok := c.config.Equipments.Outlets[eq.Outlet]
	if ok {
		log.Printf("Detaching and stopping outlet %s from equipment %s\n.", outlet.Name, eq.Name)
		c.ConfigureOutlet(outlet.Name, false, 0)
		outlet.Equipment = ""
		c.config.Equipments.Outlets[outlet.Name] = outlet
	}
	return c.store.Delete(EquipmentBucket, id)
}
