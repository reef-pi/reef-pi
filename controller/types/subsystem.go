package types

import (
	"github.com/gorilla/mux"
)

type PWM interface {
	Start() error
	Stop() error
	Set(pin int, percentage float64) error
	Get(pin int) (int, error)
	On(pin int) error
	Off(pin int) error
}

type Subsystem interface {
	Setup() error
	LoadAPI(*mux.Router)
	Start()
	Stop()
	On(string, bool) error
}

type ErrorLogger func(string, string) error

type Controller interface {
	Subsystem(string) (Subsystem, error)
	Telemetry() Telemetry
	Store() Store
	LogError(string, string) error
}

type controller struct {
	t        Telemetry
	s        Store
	logError ErrorLogger
	subFn    func(s string) (Subsystem, error)
}

func NewController(
	t Telemetry,
	s Store,
	logError func(string, string) error,
	subFn func(s string) (Subsystem, error),
) Controller {
	return &controller{
		t:        t,
		s:        s,
		logError: logError,
		subFn:    subFn,
	}
}

func (c *controller) Telemetry() Telemetry {
	return c.t
}

func (c *controller) Store() Store {
	return c.s
}

func (c *controller) LogError(id, msg string) error {
	return c.logError(id, msg)
}
func (c *controller) Subsystem(s string) (Subsystem, error) {
	return c.subFn(s)
}
