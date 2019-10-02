package controller

import (
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Subsystem interface {
	Setup() error
	LoadAPI(*DocRouter)
	Start()
	Stop()
	On(string, bool) error
}

type Controller interface {
	Subsystem(string) (Subsystem, error)
	Telemetry() telemetry.Telemetry
	Store() storage.Store
	LogError(string, string) error
}
