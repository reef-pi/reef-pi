package macro

import (
	"fmt"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.MacroBucket
const UsageBucket = storage.MacroUsageBucket

type Subsystem struct {
	sync.Mutex
	devMode    bool
	quitters   map[string]chan struct{}
	controller controller.Controller
}

func New(devMode bool, c controller.Controller) (*Subsystem, error) {
	return &Subsystem{
		devMode:    devMode,
		controller: c,
	}, nil
}

func (s *Subsystem) Setup() error {
	return s.controller.Store().CreateBucket(Bucket)
}

func (s *Subsystem) Start() {
}

func (s *Subsystem) Stop() {
}
func (s *Subsystem) On(id string, b bool) error {
	return fmt.Errorf("Macro sub system does not support 'on' API yet")
}
