package controller

import (
	"encoding/json"
	"fmt"
	"gobot.io/x/gobot"
	"log"
	"strings"
)

type Job struct {
	ID        string `json:"id"`
	Minute    string `json:"minute"`
	Day       string `json:"day"`
	Hour      string `json:"hour"`
	Second    string `json:"second"`
	Equipment string `json:"equipment"`
	Action    string `json:"action"`
	Value     int    `json:"value"`
	Name      string `json:"name"`
}

type JobRunner struct {
	name   string
	outlet *Outlet
	conn   gobot.Connection
	action OuteltAction
}

func (j *Job) Outlet(store *Store) (*Outlet, error) {
	var e Equipment
	var o Outlet

	if err := store.Get("equipments", j.Equipment, &e); err != nil {
		return nil, err
	}

	if err := store.Get("outlets", e.Outlet, &o); err != nil {
		return nil, err
	}
	return &o, nil
}

func (j *Job) Runner(store *Store, conn gobot.Connection) (*JobRunner, error) {
	o, err := j.Outlet(store)
	if err != nil {
		return nil, err
	}
	a := OuteltAction{
		Action: j.Action,
		Value:  j.Value,
	}
	return &JobRunner{
		name:   j.Name,
		outlet: o,
		conn:   conn,
		action: a,
	}, nil
}

func (r *JobRunner) Run() {
	log.Println("Job:", r.name, " Pin:", r.outlet.Pin, "Action:", r.action.Action)
	if err := r.outlet.Perform(r.conn, r.action); err != nil {
		log.Println("ERROR:", err)
	}
}
func (c *Controller) GetJob(id string) (Job, error) {
	var job Job
	return job, c.store.Get("jobs", id, &job)
}

func (c *Controller) ListJobs() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var job Job
		if err := json.Unmarshal(v, &job); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   job.ID,
			"name": job.Name,
		}, nil
	}
	return c.store.List("jobs", fn)
}

func (c *Controller) CreateJob(job Job) error {
	fn := func(id string) interface{} {
		job.ID = id
		return job
	}
	if err := c.store.Create("jobs", fn); err != nil {
		return err
	}
	return c.addToCron(job)
}

func (c *Controller) UpdateJob(id string, payload Job) error {
	return c.store.Update("jobs", id, payload)
}

func (c *Controller) DeleteJob(id string) error {
	if err := c.store.Delete("jobs", id); err != nil {
		return err
	}
	return c.deleteFromCron(id)
}

func (c *Controller) loadAllJobs() error {
	jobs, err := c.ListJobs()
	if err != nil {
		return err
	}
	if jobs == nil {
		log.Printf("No jobs present")
		return nil
	}
	for _, rawJob := range *jobs {
		job, ok := rawJob.(Job)
		if !ok {
			fmt.Errorf("Failed to typecast to job")
		}
		if err := c.addToCron(job); err != nil {
			log.Println("ERROR: Failed to add job in cron runner. Error:", err)
		}
	}
	return nil
}

func (c *Controller) addToCron(job Job) error {
	cronSpec := strings.Join([]string{job.Second, job.Minute, job.Hour, job.Day, "*", "?"}, " ")
	runner, err := job.Runner(c.store, c.conn)
	if err != nil {
		return err
	}
	cronID, err := c.cronRunner.AddJob(cronSpec, runner)
	if err != nil {
		return err
	}
	log.Println("Successfully added cron entry. ID:", cronID)
	c.cronIDs[job.ID] = cronID
	return nil
}

func (c *Controller) deleteFromCron(jobID string) error {
	id, ok := c.cronIDs[jobID]
	if !ok {
		return fmt.Errorf("Cron ID not found for job ID:", jobID)
	}
	c.cronRunner.Remove(id)
	return nil
}
