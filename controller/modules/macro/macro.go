package macro

import (
	"encoding/json"
	"fmt"
	"log"
)

//swagger:model macro
type Macro struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Steps      []Step `json:"steps"`
	Reversible bool   `json:"reversible"`
}

func (s *Subsystem) Get(id string) (Macro, error) {
	var m Macro
	return m, s.controller.Store().Get(Bucket, id, &m)
}
func (s *Subsystem) List() ([]Macro, error) {
	ms := []Macro{}
	fn := func(_ string, v []byte) error {
		var m Macro
		if err := json.Unmarshal(v, &m); err != nil {
			return err
		}
		ms = append(ms, m)
		return nil
	}
	return ms, s.controller.Store().List(Bucket, fn)
}

func (s *Subsystem) Create(m Macro) error {
	fn := func(id string) interface{} {
		m.ID = id
		return &m
	}
	return s.controller.Store().Create(Bucket, fn)
}

func (s *Subsystem) Update(id string, m Macro) error {
	m.ID = id
	return s.controller.Store().Update(Bucket, id, m)
}

func (s *Subsystem) Delete(id string) error {
	if err := s.controller.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := s.controller.Store().Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  macro-subsystem: Failed to deleted usage details for macro:", id)
	}
	return nil
}

func (s *Subsystem) Run(m Macro, reverse bool) error {
	if reverse && !m.Reversible {
		return fmt.Errorf("macro is not reversible")
	}
	log.Println("macro-subsystem. Running:", m.Name)
	steps := m.Steps
	if reverse {
		steps = []Step{}
		for i := len(m.Steps); i > 0; i-- {
			steps = append(steps, m.Steps[i-1])
		}
	}
	for i, step := range steps {
		if err := step.Run(s.controller, reverse); err != nil {
			log.Println("ERROR: macro-subsystem. Failed to execute step:", i, "of macro", m.Name, ". Error:", err)
		}
	}
	log.Println("macro-subsystem. Finished:", m.Name)
	return s.Update(m.ID, m)
}
