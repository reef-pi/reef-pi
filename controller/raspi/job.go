package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/hybridgroup/gobot"
	"github.com/ranjib/reefer/controller"
	"gopkg.in/robfig/cron.v2"
	"log"
	"strconv"
	"strings"
)

type JobAPI struct {
	db         *bolt.DB
	cronRunner *cron.Cron
	conn       gobot.Connection
	cronIDs    map[string]cron.EntryID
}

func NewJobAPI(conn gobot.Connection, db *bolt.DB) (*JobAPI, error) {
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
		db:         db,
		cronRunner: cron.New(),
		conn:       conn,
		cronIDs:    make(map[string]cron.EntryID),
	}, nil
}

func (j *JobAPI) Start() error {
	if err := j.loadAll(); err != nil {
		return err
	}
	j.cronRunner.Start()
	return nil
}

func (j *JobAPI) Stop() error {
	j.cronRunner.Stop()
	return nil
}

func (j *JobAPI) Create(payload interface{}) error {
	job, ok := payload.(controller.Job)
	if !ok {
		return fmt.Errorf("Failed to typecast to job")
	}
	err := j.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		id, _ := b.NextSequence()
		job.ID = strconv.Itoa(int(id))
		data, err := json.Marshal(job)
		if err != nil {
			return err
		}
		return b.Put([]byte(job.ID), data)
	})
	if err != nil {
		return err
	}
	return j.addToCron(job)
}

func (j *JobAPI) loadAll() error {
	jobs, err := j.List()
	if err != nil {
		return err
	}
	if jobs == nil {
		log.Printf("No jobs present")
		return nil
	}
	for _, rawJob := range *jobs {
		job, ok := rawJob.(controller.Job)
		if !ok {
			fmt.Errorf("Failed to typecast to job")
		}
		if err := j.addToCron(job); err != nil {
			log.Println("ERROR: Failed to add job in cron runner. Error:", err)
		}
	}
	return nil
}

func (j *JobAPI) addToCron(job controller.Job) error {
	s := controller.NewStore(j.db)
	cronSpec := strings.Join([]string{job.Second, job.Minute, job.Hour, job.Day, "*", "?"}, " ")
	runner, err := job.Runner(s, j.conn)
	if err != nil {
		return err
	}
	cronID, err := j.cronRunner.AddJob(cronSpec, runner)
	if err != nil {
		return err
	}
	log.Println("Successfully added cron entry. ID:", cronID)
	j.cronIDs[job.ID] = cronID
	return nil
}

func (j *JobAPI) deleteFromCron(jobID string) error {
	id, ok := j.cronIDs[jobID]
	if !ok {
		return fmt.Errorf("Cron ID not found for job ID:", jobID)
	}
	j.cronRunner.Remove(id)
	return nil
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
	err := j.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		return b.Delete([]byte(id))
	})
	if err != nil {
		return err
	}
	return j.deleteFromCron(id)
}
func (j *JobAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	err := j.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("jobs"))
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var j controller.Job
			if err := json.Unmarshal(v, &j); err != nil {
				return err
			}
			list = append(list, j)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &list, nil
}
