package types

import (
	"github.com/gorilla/mux"
)

const (
	ReefPiBucket     = "reef-pi"
	ATOBucket        = "ato"
	ATOUsageBucket   = "ato_usage"
	CameraBucket     = "camera"
	CameraItemBucket = "photos"
	InletBucket      = "inlets"
	JackBucket       = "jacks"
	OutletBucket     = "outlets"
	DoserBucket      = "doser"
	EquipmentBucket  = "equipments"
	LightingBucket   = "lightings"
	MacroBucket      = "macro"
	MacroUsageBucket = "macro_usage"
	PhBucket         = "phprobes"
)

type Subsystem interface {
	Setup() error
	LoadAPI(*mux.Router)
	Start()
	Stop()
	On(string, bool) error
}

type Controller interface {
	Subsystem(string) (Subsystem, error)
}

type Store interface {
	Get(string, string, interface{}) error
	List(string, func([]byte) error) error
	Create(string, func(string) interface{}) error
	CreateBucket(string) error
	Close() error
	CreateWithID(string, string, interface{}) error
	Update(string, string, interface{}) error
	Delete(string, string) error
	ReOpen() error
}
