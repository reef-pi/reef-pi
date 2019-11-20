package storage

const (
	ReefPiBucket           = "reef-pi"
	ATOBucket              = "ato"
	ATOUsageBucket         = "ato_usage"
	CameraBucket           = "camera"
	CameraItemBucket       = "photos"
	InletBucket            = "inlets"
	JackBucket             = "jacks"
	AnalogInputBucket      = "analog_inputs"
	OutletBucket           = "outlets"
	DoserBucket            = "doser"
	DoserUsageBucket       = "doser_usage"
	EquipmentBucket        = "equipment"
	LightingBucket         = "lightings"
	MacroBucket            = "macro"
	MacroUsageBucket       = "macro_usage"
	PhBucket               = "phprobes"
	PhCalibrationBucket    = "ph_calibration"
	PhReadingsBucket       = "ph_readings"
	TemperatureBucket      = "temperature"
	TemperatureUsageBucket = "temperature_usage"
	TimerBucket            = "timers"
	ErrorBucket            = "errors"
	DriverBucket           = "drivers"
)

type Store interface {
	RawGet(string, string) ([]byte, error)
	Get(string, string, interface{}) error
	List(string, func(string, []byte) error) error
	Create(string, func(string) interface{}) error
	CreateBucket(string) error
	Close() error
	CreateWithID(string, string, interface{}) error
	Update(string, string, interface{}) error
	RawUpdate(string, string, []byte) error
	Delete(string, string) error
	ReOpen() error
	Buckets() ([]string, error)
}
