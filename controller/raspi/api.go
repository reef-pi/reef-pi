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

type NullDeviceAPI struct{}

func (n *NullCrudAPI) Device() controller.CrudAPI {
	return &NullCrudAPI{}
}
func (n *NullCrudAPI) Module() controller.CrudAPI {
	return &NullCrudAPI{}
}
func (n *NullCrudAPI) Schedule() controller.CrudAPI {
	return &NullCrudAPI{}
}
