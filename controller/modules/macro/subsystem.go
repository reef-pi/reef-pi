package macro

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.MacroBucket
const UsageBucket = storage.MacroUsageBucket

type Subsystem struct {
	mu         sync.Mutex
	wg         sync.WaitGroup
	devMode    bool
	running    map[string]struct{}
	controller controller.Controller
}

func New(devMode bool, c controller.Controller) (*Subsystem, error) {
	return &Subsystem{
		devMode:    devMode,
		controller: c,
		running:    make(map[string]struct{}),
	}, nil
}

func (s *Subsystem) Setup() error {
	return s.controller.Store().CreateBucket(Bucket)
}

func (s *Subsystem) Start() {
}

func (s *Subsystem) Stop() {
	s.wg.Wait()
}

func (s *Subsystem) On(id string, b bool) error {
	if !b {
		// For macros there is no "turn off" operation; when the ATO sensor reads
		// full (b=false) we simply do nothing rather than running the macro in
		// reverse (which may not even be configured).
		return nil
	}
	m, err := s.Get(id)
	if err != nil {
		return err
	}
	s.mu.Lock()
	if _, alreadyRunning := s.running[id]; alreadyRunning {
		s.mu.Unlock()
		log.Println("macro-subsystem: macro already running, skipping:", m.Name)
		return nil
	}
	s.running[id] = struct{}{}
	s.mu.Unlock()

	s.wg.Add(1)
	go func() {
		defer s.wg.Done()
		defer func() {
			s.mu.Lock()
			delete(s.running, id)
			s.mu.Unlock()
		}()
		if err := s.Run(m, false); err != nil {
			log.Println("ERROR: macro-subsystem. Failed to run macro:", m.Name, err)
		}
	}()
	return nil
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
func (s *Subsystem) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("macro subsystem does not support 'GetEntity' interface")
}
