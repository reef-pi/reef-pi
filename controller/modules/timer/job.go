package timer

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const Bucket = storage.TimerBucket

type Job struct {
	ID     string          `json:"id"`
	Name   string          `json:"name"`
	Enable bool            `json:"enable"`
	Type   string          `json:"type"`
	Month  string          `json:"month"`
	Week   string          `json:"week"`
	Day    string          `json:"day"`
	Hour   string          `json:"hour"`
	Minute string          `json:"minute"`
	Second string          `json:"second"`
	Target json.RawMessage `json:"target"`
}

func (j *Job) CronSpec() string {
	return strings.Join([]string{j.Second, j.Minute, j.Hour, j.Day, j.Month, j.Week}, " ")
}

func (j *Job) Validate() error {
	parser := cron.NewParser(_cronParserSpec)
	if _, err := parser.Parse(j.CronSpec()); err != nil {
		return err
	}
	switch j.Type {
	case "reminder":
		var reminder Reminder
		if err := json.Unmarshal(j.Target, &reminder); err != nil {
			return err
		}
		if reminder.Title == "" {
			return fmt.Errorf("Missing reminder title")
		}
	case "equipment":
		var ue UpdateEquipment
		if err := json.Unmarshal(j.Target, &ue); err != nil {
			return err
		}
		if ue.ID == "" {
			return fmt.Errorf("Missing equipment")
		}
	case "macro":
		var macro TriggerMacro
		if err := json.Unmarshal(j.Target, &macro); err != nil {
			return err
		}
		if macro.ID == "" {
			return fmt.Errorf("Missing equipment")
		}
	default:
		return fmt.Errorf("Invalid timer type: %s", j.Type)
	}
	return nil
}

func (c *Controller) Get(id string) (Job, error) {
	var job Job
	return job, c.c.Store().Get(Bucket, id, &job)
}

func (c *Controller) List() ([]Job, error) {
	jobs := []Job{}
	fn := func(v []byte) error {
		var job Job
		if err := json.Unmarshal(v, &job); err != nil {
			return err
		}
		jobs = append(jobs, job)
		return nil
	}
	return jobs, c.c.Store().List(Bucket, fn)
}

func (c *Controller) Create(job Job) error {
	if err := job.Validate(); err != nil {
		return err
	}

	fn := func(id string) interface{} {
		job.ID = id
		return job
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	if job.Enable {
		return c.addToCron(job)
	}
	return nil
}

func (c *Controller) Update(id string, payload Job) error {
	j, err := c.Get(id)
	if err != nil {
		return err
	}
	if j.Enable {
		if err := c.deleteFromCron(id); err != nil {
			log.Println("ERROR: timer subsystem: Failed to remove running job from cron. Error:", err)
			return err
		}
	}
	payload.ID = id
	if err := c.c.Store().Update(Bucket, id, &payload); err != nil {
		return err
	}
	if payload.Enable {
		return c.addToCron(payload)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	j, err := c.Get(id)
	if err != nil {
		return err
	}
	if err := c.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if j.Enable {
		return c.deleteFromCron(id)
	}
	return nil
}

func (c *Controller) loadAllJobs() error {
	jobs, err := c.List()
	if err != nil {
		log.Println("WARNING: timer sub system failed to list jobs. Error:", err)
		return err
	}
	if jobs == nil {
		log.Printf("No jobs present")
		return nil
	}
	for _, job := range jobs {
		if job.Enable {
			if err := c.addToCron(job); err != nil {
				log.Println("ERROR: Failed to add job in cron runner. Error:", err)
			}
		}
	}
	return nil
}

func (c *Controller) addToCron(job Job) error {
	runner, err := c.Runner(job)
	if err != nil {
		return err
	}
	cronID, err := c.runner.AddJob(job.CronSpec(), runner)
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
		return fmt.Errorf("Cron ID not found for job ID:%s", jobID)
	}
	if c.runner != nil {
		c.runner.Remove(id)
		delete(c.cronIDs, jobID)
	}
	return nil
}
