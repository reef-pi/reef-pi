package journal

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Parameter struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Unit        string `json:"unit"`
	Description string `json:"description"`
}

type Entry struct {
	Value     float64            `json:"value"`
	Timestamp telemetry.TeleTime `json:"timestamp"`
	Comment   string             `json:"comment"`
}

func (e Entry) Before(e1 telemetry.Metric) bool {
	et := e1.(Entry)
	return e.Timestamp.Before(et.Timestamp)
}

func (e Entry) Rollup(m telemetry.Metric) (telemetry.Metric, bool) {
	return m, true
}

func (s *Subsystem) On(_ string, _ bool) error {
	return errors.New("not supported")
}

func (s *Subsystem) Get(id string) (Parameter, error) {
	return s.repo.Get(id)
}
func (s *Subsystem) List() ([]Parameter, error) {
	return s.repo.List()
}

func (s *Subsystem) Create(p Parameter) error {
	created, err := s.repo.Create(p)
	if err != nil {
		return err
	}
	s.statsMgr.Initialize(created.ID)
	return nil
}

func (s *Subsystem) Update(id string, p Parameter) error {
	return s.repo.Update(id, p)
}

func (s *Subsystem) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *Subsystem) AddEntry(id string, e Entry) error {
	if !s.statsMgr.IsLoaded(id) {
		dec := func(d json.RawMessage) interface{} {
			var u Entry
			if err := json.Unmarshal(d, &u); err != nil {
				log.Println("ERROR:[journal-subsystem] Failed to unmarshal usage value. ", err)
			}
			return u
		}
		if err := s.statsMgr.Load(id, dec); err != nil {
			log.Println("ERROR:[journal-subsystem] Failed to load usage value. ", err)
		}
	}
	s.statsMgr.Update(id, e)
	return s.statsMgr.Save(id)
}
