package macro

import (
	"encoding/json"
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
	m, err := s.Get(id)
	if err != nil {
		return err
	}
	return s.Run(m, b)
}

func (s *Subsystem) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.ATOBucket:
		fallthrough
	case storage.EquipmentBucket:
		fallthrough
	case storage.TemperatureBucket:
		fallthrough
	case storage.DoserBucket:
		fallthrough
	case storage.PhBucket:
		fallthrough
	case storage.TimerBucket:
		fallthrough
	case storage.MacroBucket:
		ms, err := s.List()
		if err != nil {
			return deps, nil
		}
		for _, m := range ms {
			for i, step := range m.Steps {
				if step.Type == depType {
					var g GenericStep
					if err := json.Unmarshal(step.Config, &g); err != nil {
						return deps, err
					}
					if g.ID == id {
						deps = append(deps, fmt.Sprintf("%s(step: %d)", m.Name, i+1))
					}
				}
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown dep type:%s", depType)
	}
}
