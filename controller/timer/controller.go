package timer

import (
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/types"
	"gopkg.in/robfig/cron.v2"
	"log"
)

type Controller struct {
	store     types.Store
	runner    *cron.Cron
	cronIDs   map[string]cron.EntryID
	telemetry types.Telemetry
	equipment *equipment.Controller
}

func New(store types.Store, telemetry types.Telemetry, e *equipment.Controller) *Controller {
	return &Controller{
		cronIDs:   make(map[string]cron.EntryID),
		telemetry: telemetry,
		store:     store,
		runner:    cron.New(),
		equipment: e,
	}
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	jobs, err := c.List()
	if err != nil {
		return false, err
	}
	for _, j := range jobs {
		if (j.Type == "equipment") && (j.Equipment.ID == id) {
			return true, nil
		}
	}
	return false, nil
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
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
