package types

const (
	ReefPiBucket           = "reef-pi"
	ATOBucket              = "ato"
	ATOUsageBucket         = "ato_usage"
	CameraBucket           = "camera"
	CameraItemBucket       = "photos"
	InletBucket            = "inlets"
	JackBucket             = "jacks"
	OutletBucket           = "outlets"
	DoserBucket            = "doser"
	DoserUsageBucket       = "doser_usage"
	EquipmentBucket        = "equipment"
	LightingBucket         = "lightings"
	MacroBucket            = "macro"
	MacroUsageBucket       = "macro_usage"
	PhBucket               = "phprobes"
	TemperatureBucket      = "temperature"
	TemperatureUsageBucket = "temperature_usage"
	TimerBucket            = "timers"
	ErrorBucket            = "errors"
)

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
