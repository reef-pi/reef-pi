package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	pi "github.com/hybridgroup/gobot/platforms/raspi"
	"github.com/ranjib/reefer/controller"
	"log"
)

type JobAPI struct {
	conn *pi.RaspiAdaptor
	db   *bolt.DB
}

func NewJobAPI(conn *pi.RaspiAdaptor, db *bolt.DB) (controller.CrudAPI, error) {
	err := db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte("jobs")) != nil {
			return nil
		}
		log.Println("Initializing DB for jobs bucket")
		_, err := tx.CreateBucket([]byte("jobs"))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &JobAPI{
		conn: conn,
		db:   db,
	}, nil
}

func (j *JobAPI) Create(payload interface{}) error {
	job, ok := payload.(controller.Job)
	if !ok {
		return fmt.Errorf("Failed to typecast to job")
	}

	data, err := json.Marshal(job)
	if err != nil {
		return err
	}
	return j.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		return b.Put([]byte(job.ID), data)
	})
}

func (j *JobAPI) Get(id string) (interface{}, error) {
	var data []byte
	var job controller.Job
	err := j.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		data = b.Get([]byte(id))
		return nil
	})
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(data, &job); err != nil {
		return nil, err
	}
	return &job, nil
}

func (j *JobAPI) Update(id string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return j.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		return b.Put([]byte(id), data)
	})
}

func (j *JobAPI) Delete(id string) error {
	return j.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		return b.Delete([]byte(id))
	})
}
func (j *JobAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	err := j.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		c := b.Cursor()
		for k, _ := c.First(); k != nil; k, _ = c.Next() {
			list = append(list, string(k))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &list, nil
}
