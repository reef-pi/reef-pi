package controller

import (
    "fmt"
    "log"
    "sync"

    "github.com/gorilla/mux"
)

type SubsystemComposite struct {
    mu         *sync.RWMutex
    components map[string]Subsystem
}

func NewSubsystemComposite() *SubsystemComposite {
    return &SubsystemComposite{
        mu:         new(sync.RWMutex),
        components: make(map[string]Subsystem),
    }
}

func (s *SubsystemComposite) Unload(name string) {
    s.mu.Lock()
    defer s.mu.Unlock()
    delete(s.components, name)
}

func (s *SubsystemComposite) UnloadAll() {
	for sName, sController := range s.components {
		log.Println("Unloading module:", sName)
		sController.Stop()
		s.Unload(sName)
		log.Println("Successfully unloaded module:", sName)
	}
}

func (s *SubsystemComposite) Load(name string, sub Subsystem) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.components[name] = sub
}

func (s *SubsystemComposite) Sub(name string) (Subsystem, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sub, ok := s.components[name]
	if !ok {
		return nil, fmt.Errorf("subsystem not present: %s", name)
	}
	return sub, nil
}

func (s *SubsystemComposite) LoadAPI(router *mux.Router) {
    for _, sController := range s.components {
        sController.LoadAPI(router)
    }
}

func (s *SubsystemComposite) Setup() error {
	for sName, sController := range s.components {
		log.Println("Starting subsystem:", sName)
		if err := sController.Setup(); err != nil {
			log.Println("ERROR: Failed to setup subsystem:", sName)
			return fmt.Errorf("%s:%w", sName, err)
		}
		sController.Start()
		log.Println("Successfully started subsystem:", sName)
	}
	return nil
}
