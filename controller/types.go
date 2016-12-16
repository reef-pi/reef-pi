package controller

type CrudAPI interface {
	Get(string) (interface{}, error)
	Update(string, interface{}) error
	Create(interface{}) error
	Delete(string) error
	List() (*[]interface{}, error)
}

type API interface {
	Lighting() LightingAPI
	Jobs() CrudAPI
	Equipments() CrudAPI
	Modules() CrudAPI
	Boards() CrudAPI
	Outlets() CrudAPI
}

type Controller interface {
	API
	GetModule(string) (Module, error)
	Start() error
	Stop() error
	Name() string
}
type Equipment struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Outlet string `json:"outlet"`
}

type Job struct {
	ID        string `json:"id"`
	Minute    string `json:"minute"`
	Day       string `json:"day"`
	Hour      string `json:"hour"`
	Second    string `json:"second"`
	Equipment string `json:"equipment"`
	Action    string `json:"action"`
	Name      string `json:"name"`
}

type Connection struct {
	Board string `json:"board"`
	Pin   uint   `json:"pin"`
}

type Outlet struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Connection Connection `json:"connection"`
}

type Board struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Pins uint   `json:"pins"`
}
