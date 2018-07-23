package macro

import (
	"encoding/json"
	"log"
)

type Step struct {
	Type   string          `json:"type"`
	Config json.RawMessage `json:"config"`
}

type Macro struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Steps []Step `json:"steps"`
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
