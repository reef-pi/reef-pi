package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/ranjib/reefer/controller"
	"gobot.io/x/gobot"
	"gopkg.in/robfig/cron.v2"
	"log"
	"strings"
)

type JobAPI struct {
	store      *controller.Store
	cronRunner *cron.Cron
	conn       gobot.Connection
	cronIDs    map[string]cron.EntryID
}

func NewJobAPI(conn gobot.Connection, store *controller.Store) (*JobAPI, error) {
	if err := store.CreateBucket("jobs"); err != nil {
		return nil, err
	}
	return &JobAPI{
		store:      store,
		cronRunner: cron.New(),
		conn:       conn,
		cronIDs:    make(map[string]cron.EntryID),
	}, nil
}

func (j *JobAPI) Get(id string) (interface{}, error) {
	var job controller.Job
	return &job, j.store.Get("jobs", id, &job)
}

func (j *JobAPI) List() (*[]interface{}, error) {

	fn := func(v []byte) (interface{}, error) {
		var job controller.Job
		if err := json.Unmarshal(v, &job); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   job.ID,
			"name": job.Name,
		}, nil
	}
	return j.store.List("jobs", fn)
}

func (j *JobAPI) Create(payload interface{}) error {
	job, ok := payload.(controller.Job)
	if !ok {
		return fmt.Errorf("Failed to typecast to job")
	}
	fn := func(id string) interface{} {
		job.ID = id
		return job
	}
	if err := j.store.Create("jobs", fn); err != nil {
		return err
	}
	return j.addToCron(job)
}

func (j *JobAPI) Update(id string, payload interface{}) error {
	return j.store.Update("jobs", id, payload)
}

func (j *JobAPI) Delete(id string) error {
	if err := j.store.Delete("jobs", id); err != nil {
		return err
	}
	return j.deleteFromCron(id)
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
	cronSpec := strings.Join([]string{job.Second, job.Minute, job.Hour, job.Day, "*", "?"}, " ")
	runner, err := job.Runner(j.store, j.conn)
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
