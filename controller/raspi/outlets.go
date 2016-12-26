package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/ranjib/reefer/controller"
	"gobot.io/x/gobot"
)

type OutletAPI struct {
	store *controller.Store
	conn  gobot.Connection
}

func NewOutletAPI(conn gobot.Connection, store *controller.Store) (*OutletAPI, error) {
	if err := store.CreateBucket("outlets"); err != nil {
		return nil, err
	}
	return &OutletAPI{
		store: store,
		conn:  conn,
	}, nil
}
func (o *OutletAPI) Get(id string) (interface{}, error) {
	var outlet controller.Outlet
	return &outlet, o.store.Get("outlets", id, &outlet)
}

func (o *OutletAPI) List() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var outlet controller.Outlet
		if err := json.Unmarshal(v, &outlet); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   outlet.ID,
			"name": outlet.Name,
		}, nil
	}
	return o.store.List("outlets", fn)
}

func (o *OutletAPI) Create(payload interface{}) error {
	outlet, ok := payload.(controller.Outlet)
	if !ok {
		return fmt.Errorf("Failed to typecast to outlet")
	}
	fn := func(id string) interface{} {
		outlet.ID = id
		return outlet
	}
	return o.store.Create("outlets", fn)
}

func (o *OutletAPI) Update(id string, payload interface{}) error {
	return o.store.Update("outlets", id, payload)
}

func (o *OutletAPI) Delete(id string) error {
	return o.store.Delete("outlets", id)
}

func (o *OutletAPI) Configure(id string, a controller.OuteltAction) error {
	var outlet controller.Outlet
	if err := o.store.Get("outlets", id, &outlet); err != nil {
		return err
	}
	return outlet.Perform(o.conn, a)
}
