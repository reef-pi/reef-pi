package lighting

import (
	"encoding/json"
	"fmt"
)

func (c *Controller) GetJack(id string) (Jack, error) {
	var j Jack
	return j, c.store.Get(JackBucket, id, &j)
}

func (c *Controller) ListJacks() ([]Jack, error) {
	jacks := []Jack{}
	fn := func(v []byte) error {
		var j Jack
		if err := json.Unmarshal(v, &j); err != nil {
			return err
		}
		jacks = append(jacks, j)
		return nil
	}
	return jacks, c.store.List(JackBucket, fn)
}

func (c *Controller) CreateJack(j Jack) error {
	if j.Name == "" {
		return fmt.Errorf("Jack name can not be empty")
	}
	if len(j.Pins) == 0 {
		return fmt.Errorf("Jack should have pins associated with it")
	}
	fn := func(id string) interface{} {
		j.ID = id
		return &j
	}
	return c.store.Create(JackBucket, fn)
}

func (c *Controller) UpdateJack(id string, j Jack) error {
	j.ID = id
	if err := c.store.Update(JackBucket, id, j); err != nil {
		return err
	}
	return nil
}

func (c *Controller) DeleteJack(id string) error {
	_, err := c.GetJack(id)
	if err != nil {
		return err
	}
	return c.store.Delete(JackBucket, id)
}
