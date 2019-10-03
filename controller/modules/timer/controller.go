package timer

import (
	"encoding/json"
	"log"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

const _cronParserSpec = cron.Second | cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow | cron.Descriptor

type Controller struct {
	runner    *cron.Cron
	cronIDs   map[string]cron.EntryID
	equipment *equipment.Controller
	c         controller.Controller
	macro     controller.Subsystem
}

func New(c controller.Controller, e *equipment.Controller, macro controller.Subsystem) *Controller {
	return &Controller{
		cronIDs:   make(map[string]cron.EntryID),
		runner:    cron.New(cron.WithParser(cron.NewParser(_cronParserSpec))),
		equipment: e,
		c:         c,
		macro:     macro,
	}
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	jobs, err := c.List()
	if err != nil {
		return false, err
	}
	for _, j := range jobs {
		if j.Type == "equipment" {
			var ue UpdateEquipment
			if err := json.Unmarshal(j.Target, &ue); err != nil {
				return false, err
			}
			return ue.ID == id, nil
		}
	}
	return false, nil
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
