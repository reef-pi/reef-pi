package macro

import (
	"encoding/json"
	"fmt"
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
	fn := func(id string) interface{} {
		m.ID = id
		m.Enable = false // macros are always enabled by run
		return &m
	}
	return s.store.Create(Bucket, fn)
}

func (s *Subsystem) Update(id string, m Macro) error {
	m.ID = id
	m.Enable = false // macros are always enabled by run
	return s.store.Update(Bucket, id, m)
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

func (s *Subsystem) Run(m Macro) error {
	if m.Enable {
		return fmt.Errorf("Macro: %s is already running", m.Name)
	}
	m.Enable = true
	if err := s.Update(m.ID, m); err != nil {
		return err
	}
	for i, step := range m.Steps {
		if err := step.Run(s.controller); err != nil {
			log.Println("ERROR: macro subsystem. Failed to execute step:", i, "of macro", m.Name, ". Error:", err)
			return err
		}
	}
	log.Println("macro subsystem. Finished:", m.Name)
	m.Enable = false
	return s.Update(m.ID, m)
}
