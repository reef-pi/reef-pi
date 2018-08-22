package macro

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"sync"
)

const Bucket = types.MacroBucket
const UsageBucket = types.MacroUsageBucket

type Subsystem struct {
	sync.Mutex
	devMode    bool
	quitters   map[string]chan struct{}
	statsMgr   *utils.StatsManager
	controller types.Controller
}

func New(devMode bool, c types.Controller) (*Subsystem, error) {
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
