package timer

// TODO Remove in 2.0 release

import (
	"encoding/json"
)

type OldJob struct {
	ID        string `json:"id"`
	Minute    string `json:"minute"`
	Day       string `json:"day"`
	Hour      string `json:"hour"`
	Second    string `json:"second"`
	Equipment string `json:"equipment"`
	On        bool   `json:"on"`
	Name      string `json:"name"`
}

func (c *Controller) updateOldJobs() ([]Job, error) {
	ojs := []OldJob{}
	njs := []Job{}
	fn := func(v []byte) error {
		var j OldJob
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		ojs = append(ojs, j)
		return nil
	}
	if err := c.store.List(Bucket, fn); err != nil {
		return njs, err
	}
	for _, o := range ojs {
		j := Job{
			ID:        o.ID,
			Minute:    o.Minute,
			Day:       o.Day,
			Hour:      o.Hour,
			Second:    o.Second,
			Name:      o.Name,
			Type:      "equipment",
			Equipment: UpdateEquipment{ID: o.Equipment, On: o.On},
		}
		if err := c.store.Update(Bucket, o.ID, &j); err != nil {
			return njs, err
		}
		njs = append(njs, j)
	}
	return njs, nil
}
