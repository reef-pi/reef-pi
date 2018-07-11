package utils

type PWM interface {
	Start() error
	Stop() error
	Set(pin, percentage int) error
	Get(pin int) (int, error)
	On(pin int) error
	Off(pin int) error
}
