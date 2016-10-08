package controller

type Device interface {
	On() error
	Off() error
	Name() string
}

type Lighting interface {
	Device
	SetValue(uint) error
}

type Scheduler interface {
	Name() string
	Start(Device) error
	Stop() error
	IsRunning() bool
}

type Controller interface {
	GetDevice(string) (Device, error)
	Schedule(Device, Scheduler) error
	GetLighting() (Lighting, error)
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
