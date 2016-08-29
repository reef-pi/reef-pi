package controller

type Device interface {
	On() error
	Off() error
	Name() string
}

type Controller interface {
	GetDevice(string) (Device, error)
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
