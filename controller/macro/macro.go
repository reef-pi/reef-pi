package macro

import (
	"encoding/json"
	"log"
)

type Macro struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Steps  []Step `json:"steps"`
	Enable bool   `json:"enable"`
}

func (s *Subsystem) Get(id string) (Macro, error) {
	var m Macro
	return m, s.store.Get(Bucket, id, &m)
}
func (s *Subsystem) List() ([]Macro, error) {
	ms := []Macro{}
	fn := func(v []byte) error {
		var m Macro
		if err := json.Unmarshal(v, &m); err != nil {
			return err
		}
		ms = append(ms, m)
		return nil
	}
	return ms, s.store.List(Bucket, fn)
}

func (s *Subsystem) Create(m Macro) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	fn := func(id string) interface{} {
		m.ID = id
		return &m
	}
	return s.store.Create(Bucket, fn)
}

func (s *Subsystem) Update(id string, m Macro) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	m.ID = id
	if err := s.store.Update(Bucket, id, m); err != nil {
		return err
	}
	if m.Enable {
		for i, step := range m.Steps {
			if err := step.Run(s.controller); err != nil {
				return err
			}
			log.Printf("Macro sub-system: Macro: %s, Step:%d executed successfully\n", m.Name, i)
		}
	}
	return nil
}

func (s *Subsystem) Delete(id string) error {
	if err := s.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := s.store.Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  macro subsystem: Failed to deleted usage details for macro:", id)
	}
	return nil
}

func (s *Subsystem) Run(id string) error {
	m, err := s.Get(id)
	if err != nil {
		return err
	}
	log.Println("macro subsystem. Running:", m.Name)
	for i, step := range m.Steps {
		if err := step.Run(s.controller); err != nil {
			log.Println("ERROR: macro subsystem. Failed to execute step:", i, "of macro", m.Name, ". Error:", err)
			return err
		}
	}
	log.Println("macro subsystem. Finished:", m.Name)
	return nil
}
