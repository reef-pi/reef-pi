package journal

import (
	"fmt"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const Bucket = storage.JournalBucket
const UsageBucket = storage.JournalUsageBucket

type Subsystem struct {
	statsMgr telemetry.StatsManager
	c        controller.Controller
}

func New(c controller.Controller) *Subsystem {
	return &Subsystem{
		c:        c,
		statsMgr: c.Telemetry().NewStatsManager(UsageBucket),
	}
}

func (s *Subsystem) Setup() error {
	if err := s.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	return s.c.Store().CreateBucket(UsageBucket)
}

func (s *Subsystem) Start() {}
func (s *Subsystem) Stop() {
}
func (s *Subsystem) InUse(_, _ string) ([]string, error) { return []string{}, nil }

func (s *Subsystem) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("journal subsystem does not support 'GetEntity' interface")
}
