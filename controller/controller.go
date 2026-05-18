package controller

import (
	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Subsystem interface {
	Setup() error
	LoadAPI(chi.Router)
	Start()
	Stop()
	On(string, bool) error
	InUse(string, string) ([]string, error)
	GetEntity(string) (Entity, error)
}

type Controller interface {
	Subsystem(string) (Subsystem, error)
	Telemetry() telemetry.Telemetry
	Store() storage.Store
	LogError(string, string) error
	DM() *device_manager.DeviceManager
}

type Entity interface {
	EName() string
	Status() (interface{}, error)
}
