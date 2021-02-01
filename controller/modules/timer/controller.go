package timer

import (
	"encoding/json"
	"fmt"
	"log"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
)

const _cronParserSpec = cron.Second | cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor

type Controller struct {
	runner  *cron.Cron
	cronIDs map[string]cron.EntryID
	c       controller.Controller
}

func New(c controller.Controller) *Controller {
	return &Controller{
		cronIDs: make(map[string]cron.EntryID),
		runner:  cron.New(cron.WithParser(cron.NewParser(_cronParserSpec))),
		c:       c,
	}
}

func (c *Controller) Setup() error {
	return c.c.Store().CreateBucket(Bucket)
}

func (c *Controller) Start() {
	if err := c.loadAllJobs(); err != nil {
		log.Println("ERROR: timer-subsystem: Failed to load timer jobs. Error:", err)
	}
	c.runner.Start()
}

func (c *Controller) Stop() {
	c.runner.Stop()
}

func (c *Controller) On(id string, on bool) error {
	j, err := c.Get(id)
	if err != nil {
		return err
	}
	j.Enable = on
	return c.Update(id, j)
}

func (c *Controller) InUse(depType, id string) ([]string, error) {
	var deps []string
	switch depType {
	case storage.MacroBucket, storage.EquipmentBucket, storage.ATOBucket, storage.CameraBucket, storage.DoserBucket, storage.LightingBucket, storage.PhBucket, storage.TemperatureBucket:
		ts, err := c.List()
		if err != nil {
			return deps, err
		}
		for _, timer := range ts {
			if timer.Type == depType {
				var m Trigger
				if err := json.Unmarshal(timer.Target, &m); err != nil {
					return deps, err
				}
				if m.ID == id {
					deps = append(deps, timer.Name)
				}
			}
		}
		return deps, nil
	default:
		return deps, fmt.Errorf("unknown dep type:%s", depType)
	}
}
func (c *Controller) Runner(j Job) (cron.Job, error) {
	switch j.Type {
	case "reminder":
		var reminder Reminder
		if err := json.Unmarshal(j.Target, &reminder); err != nil {
			return nil, err
		}
		return &ReminderRunner{
			t:     c.c.Telemetry(),
			title: "[reef-pi Reminder]" + reminder.Title,
			body:  reminder.Message,
		}, nil
	case storage.MacroBucket, storage.EquipmentBucket, storage.ATOBucket, storage.CameraBucket, storage.DoserBucket, storage.LightingBucket, storage.PhBucket, storage.TemperatureBucket:
		return NewSubSystemRunner(j.Type, c.c, j.Target)
	default:
		return nil, fmt.Errorf("Failed to find suitable job runner")
	}
}
