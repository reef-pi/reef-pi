package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/ranjib/reefer/controller"
	pi "gobot.io/x/gobot/platforms/raspi"
)

type EquipmentAPI struct {
	conn  *pi.Adaptor
	store *controller.Store
}

func NewEquipmentAPI(conn *pi.Adaptor, store *controller.Store) (controller.CrudAPI, error) {
	if err := store.CreateBucket("equipments"); err != nil {
		return nil, err
	}
	return &EquipmentAPI{
		conn:  conn,
		store: store,
	}, nil
}

func (e *EquipmentAPI) Get(id string) (interface{}, error) {
	var eq controller.Equipment
	return &eq, e.store.Get("equipments", id, &eq)
}

func (e *EquipmentAPI) List() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var e controller.Equipment
		if err := json.Unmarshal(v, &e); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   e.ID,
			"name": e.Name,
		}, nil
	}
	return e.store.List("equipments", fn)
}

func (e *EquipmentAPI) Create(payload interface{}) error {
	eq, ok := payload.(controller.Equipment)
	if !ok {
		return fmt.Errorf("Failed to typecast to equipment")
	}
	fn := func(id string) interface{} {
		eq.ID = id
		return eq
	}
	return e.store.Create("equipments", fn)
}

func (e *EquipmentAPI) Update(id string, payload interface{}) error {
	return e.store.Update("equipments", id, payload)
}

func (e *EquipmentAPI) Delete(id string) error {
	return e.store.Delete("equipments", id)
}
