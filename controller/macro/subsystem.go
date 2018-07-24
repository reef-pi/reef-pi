package macro

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"sync"
)

const Bucket = "macro"
const UsageBucket = "macro_usage"

type Subsystem struct {
	telemetry *utils.Telemetry
	store     utils.Store
	mu        sync.Mutex
	devMode   bool
	quitters  map[string]chan struct{}
	statsMgr  *utils.StatsManager
}

func New(devMode bool, store utils.Store, telemetry *utils.Telemetry) (*Subsystem, error) {
	return &Subsystem{
		mu:        sync.Mutex{},
		telemetry: telemetry,
		store:     store,
		devMode:   devMode,
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
	return nil // TODO
}
