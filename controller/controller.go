package controller

import (
	"github.com/ThreeDotsLabs/watermill/pubsub/gochannel"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Subsystem interface {
	Setup() error
	LoadAPI(*mux.Router)
	Start()
	Stop()
	On(string, bool) error
	InUse(string, string) ([]string, error)
}

type Controller interface {
	Subsystem(string) (Subsystem, error)
	Telemetry() telemetry.Telemetry
	PubSub() *gochannel.GoChannel
	Store() storage.Store
	LogError(string, string) error
	DM() *device_manager.DeviceManager
}
