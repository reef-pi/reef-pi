package controller

type CrudAPI interface {
	Get(string) (interface{}, error)
	Update(string, interface{}) error
	Create(interface{}) error
	Delete(string) error
	List() (*[]interface{}, error)
}
type OutletAPI interface {
	CrudAPI
	Configure(string, OuteltAction) error
}

type API interface {
	Lighting() LightingAPI
	Jobs() CrudAPI
	Equipments() CrudAPI
	Boards() CrudAPI
	Outlets() OutletAPI
	StartTime() string
}

type Controller interface {
	API
	Start() error
	Stop() error
	Name() string
}
type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
}

type Board struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Pins uint   `json:"pins"`
}
