package types

import (
	"github.com/gorilla/mux"
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
