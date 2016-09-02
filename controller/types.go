package controller

type Device interface {
	On() error
	Off() error
	Name() string
}

type Scheduler interface {
	Start(Device) error
	Stop() error
}

type Controller interface {
	GetDevice(string) (Device, error)
	Schedule(Device, Scheduler) error
	Start() error
	Stop() error
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
