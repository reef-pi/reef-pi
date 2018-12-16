package controller

import (
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type PWMx interface {
	Start() error
	Stop() error
	Set(pin int, percentage float64) error
	Get(pin int) (int, error)
	On(pin int) error
	Off(pin int) error
}

type controller struct {
	t        telemetry.Telemetry
	s        storage.Store
	logError telemetry.ErrorLogger
	subFn    func(s string) (Subsystem, error)
}

func NewController(
	t telemetry.Telemetry,
	s storage.Store,
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

func (c *controller) Telemetry() telemetry.Telemetry {
	return c.t
}

func (c *controller) Store() storage.Store {
	return c.s
}

func (c *controller) LogError(id, msg string) error {
	return c.logError(id, msg)
}
func (c *controller) Subsystem(s string) (Subsystem, error) {
	return c.subFn(s)
}
