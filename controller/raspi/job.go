package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/hybridgroup/gobot"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"github.com/ranjib/reefer/controller"
	"github.com/robfig/cron"
	"log"
	"strconv"
	"strings"
)

type JobAPI struct {
	db         *bolt.DB
	cronRunner *cron.Cron
	conn       gobot.Connection
}

func NewJobAPI(conn gobot.Connection, db *bolt.DB, cronRunner *cron.Cron) (controller.CrudAPI, error) {
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
		cronRunner: cronRunner,
		conn:       conn,
	}, nil
}

func (j *JobAPI) PinForJob(job controller.Job) (int, error) {
	var err error
	var data []byte
	var eq controller.Equipment
	err = j.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("equipments"))
		data = b.Get([]byte(job.Equipment))
		return nil
	})
	if err != nil {
		return 0, err
	}
	if err = json.Unmarshal(data, &eq); err != nil {
		return 0, err
	}
	err = j.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("outlets"))
		data = b.Get([]byte(eq.Outlet))
		return nil
	})
	if err != nil {
		return 0, err
	}
	var outlet controller.Outlet
	if err = json.Unmarshal(data, &outlet); err != nil {
		return 0, err
	}
	return int(outlet.Connection.Pin), nil
}

func (j *JobAPI) Create(payload interface{}) error {
	job, ok := payload.(controller.Job)
	if !ok {
		return fmt.Errorf("Failed to typecast to job")
	}
	pin, err1 := j.PinForJob(job)
	if err1 != nil {
		return err1
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
	cronSpec := strings.Join([]string{job.Second, job.Minute, job.Hour, job.Day, "*", "?"}, " ")
	runner := func() {
		driver := gpio.NewDirectPinDriver(j.conn, job.Name, strconv.Itoa(pin))
		if job.Action == "off" {
			log.Println("Job:", job.Name, " Pin:", pin, "State: LOW")
			if err := driver.Off(); err != nil {
				log.Println("ERROR:", err)
			}
		} else {
			log.Println("Job:", job.Name, " Pin:", pin, "State: HIGH")
			if err := driver.On(); err != nil {
				log.Println("ERROR:", err)
			}
		}
	}
	return j.cronRunner.AddFunc(cronSpec, runner)
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
