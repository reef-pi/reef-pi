package raspi

import (
	"github.com/ranjib/reefer/controller"
)

type NullCrudAPI struct{}

func (n *NullCrudAPI) Create(_ interface{}) error {
	return nil
}

func (n *NullCrudAPI) Get(_ string) (interface{}, error) {
	return nil, nil
}

func (n *NullCrudAPI) Update(_ string, _ interface{}) error {
	return nil
}

func (n *NullCrudAPI) Delete(_ string) error {
	return nil
}

func (n *NullCrudAPI) List() (*[]interface{}, error) {
	var ret []interface{}
	return &ret, nil
}

func (r *Raspi) Boards() controller.GetUpdateAPI {
	return r.boardAPI
}

func (r *Raspi) Outlets() controller.OutletAPI {
	return r.outletAPI
}
func (r *Raspi) Devices() controller.CrudAPI {
	return r.deviceAPI
}

func (r *Raspi) Modules() controller.CrudAPI {
	return &NullCrudAPI{}
}

func (r *Raspi) Jobs() controller.CrudAPI {
	return r.jobAPI
}

func (r *Raspi) Equipments() controller.CrudAPI {
	return r.equipmentAPI
}
