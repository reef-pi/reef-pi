package macro

import (
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
	return s.repo.Get(id)
}
func (s *Subsystem) List() ([]Macro, error) {
	return s.repo.List()
}

func (s *Subsystem) Create(m Macro) error {
	return s.repo.Create(m)
}

func (s *Subsystem) Update(id string, m Macro) error {
	return s.repo.Update(id, m)
}

func (s *Subsystem) Delete(id string) error {
	return s.repo.Delete(id)
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
	return nil
}
