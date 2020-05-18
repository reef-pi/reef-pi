package journal

import (
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

func (s *Subsystem) Start()                              {}
func (s *Subsystem) Stop()                               {}
func (s *Subsystem) InUse(_, _ string) ([]string, error) { return []string{}, nil }
