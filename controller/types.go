package controller

type Device interface {
	On() error
	Off() error
	Name() string
	Type() string
	Config() interface{}
}

type Scheduler interface {
	Name() string
	Start(Device) error
	Stop() error
	IsRunning() bool
}

type Module interface {
	Name() string
	Configure(interface{}) error
	Enable() error
	Disable() error
	IsEnabled() bool
}

type GetUpdateAPI interface {
	Get(string) (interface{}, error)
	Update(string, interface{}) error
}

type CrudAPI interface {
	GetUpdateAPI
	Create(interface{}) error
	Delete(string) error
	List() (*[]interface{}, error)
}

type LightingAPI interface {
	Enable(interface{}) error
	Disable() error
	IsEnabled() (bool, error)
	Config() interface{}
}

type OutletAPI interface {
	Get() (interface{}, error)
	Update(interface{}) error
}

type API interface {
	Devices() CrudAPI
	Lighting() LightingAPI
	Jobs() CrudAPI
	Equipments() CrudAPI
	Modules() CrudAPI
	Boards() GetUpdateAPI
	Outlets() OutletAPI
}

type Controller interface {
	API
	Schedule(Device, Scheduler) error
	GetModule(string) (Module, error)
	Start() error
	Stop() error
	Name() string
}

type NullDevice struct {
}

func (n *NullDevice) On() error {
	return nil
}

func (n *NullDevice) Off() error {
	return nil
}

func (n *NullDevice) Name() string {
	return "Null device"
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
	Equipment string `json:"equipment"`
	Action    string `json:"action"`
}
