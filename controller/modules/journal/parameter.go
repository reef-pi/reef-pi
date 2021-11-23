package journal

import (
	"encoding/json"
	"errors"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"log"
)

type Parameter struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Unit        string `json:"unit"`
	Description string `json:"description"`
}

type Entry struct {
	Value     float64 `json:"value"`
	Timestamp string  `json:"timestamp"`
	Comment   string  `json:"comment"`
}

func (e Entry) Before(_ telemetry.Metric) bool {
	return false
}

func (e Entry) Rollup(m telemetry.Metric) (telemetry.Metric, bool) {
	return m, true
}

func (s *Subsystem) On(_ string, _ bool) error {
	return errors.New("not supported")
}

func (s *Subsystem) Get(id string) (Parameter, error) {
	var p Parameter
	return p, s.c.Store().Get(Bucket, id, &p)
}
func (s *Subsystem) List() ([]Parameter, error) {
	params := []Parameter{}
	fn := func(_ string, v []byte) error {
		var p Parameter
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		params = append(params, p)
		return nil
	}
	return params, s.c.Store().List(Bucket, fn)
}

func (s *Subsystem) Create(p Parameter) error {
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	if err := s.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	s.statsMgr.Initialize(p.ID)
	return nil
}

func (s *Subsystem) Update(id string, p Parameter) error {
	p.ID = id
	return s.c.Store().Update(Bucket, id, p)
}

func (s *Subsystem) Delete(id string) error {
	if err := s.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := s.c.Store().Delete(UsageBucket, id); err != nil {
		log.Println("ERROR: journal-subsystem: Failed to deleted usage details for journal:", id)
	}
	return nil
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
