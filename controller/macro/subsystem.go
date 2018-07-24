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
	telemetry  *utils.Telemetry
	store      utils.Store
	mu         sync.Mutex
	devMode    bool
	quitters   map[string]chan struct{}
	statsMgr   *utils.StatsManager
	controller types.Controller
}

func New(devMode bool, c types.Controller, store utils.Store, telemetry *utils.Telemetry) (*Subsystem, error) {
	return &Subsystem{
		mu:         sync.Mutex{},
		telemetry:  telemetry,
		store:      store,
		devMode:    devMode,
		controller: c,
	}, nil
}

func (s *Subsystem) Setup() error {
	return s.store.CreateBucket(Bucket)
}

func (s *Subsystem) Start() {
}

func (s *Subsystem) Stop() {
}
func (s *Subsystem) On(id string, b bool) error {
	return fmt.Errorf("Macro sub system does not support 'on' API yet")
}
