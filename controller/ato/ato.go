package ato

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"math/rand"
	"time"
)

type Notify struct {
	Enable bool `json:"enable"`
	Max    int  `json:"max"`
}

type ATO struct {
	ID      string        `json:"id"`
	Inlet   string        `json:"inlet"`
	Pump    string        `json:"pump"`
	Period  time.Duration `json:"period"`
	Control bool          `json:"control"`
	Enable  bool          `json:"enable"`
	Notify  Notify        `json:"notify"`
	Name    string        `json:"name"`
}

func (c *Controller) Get(id string) (ATO, error) {
	var a ATO
	return a, c.store.Get(Bucket, id, &a)
}
func (c Controller) List() ([]ATO, error) {
	atos := []ATO{}
	fn := func(v []byte) error {
		var a ATO
		if err := json.Unmarshal(v, &a); err != nil {
			return err
		}
		atos = append(atos, a)
		return nil
	}
	return atos, c.store.List(Bucket, fn)
}

func (c *Controller) Create(a ATO) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Period <= 0 {
		return fmt.Errorf("Check period for ato controller must be greater than zero")
	}
	fn := func(id string) interface{} {
		a.ID = id
		return &a
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if a.Enable {
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		go c.Run(a, quit)
	}
	return nil
}

func (c *Controller) Update(id string, a ATO) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	a.ID = id
	if a.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied:%d", a.Period)
	}
	if err := c.store.Update(Bucket, id, a); err != nil {
		return err
	}
	quit, ok := c.quitters[a.ID]
	if ok {
		close(quit)
		delete(c.quitters, a.ID)
	}
	if a.Enable {
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		go c.Run(a, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.store.Delete(Bucket, id); err != nil {
		return err
	}
	if err := c.store.Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  ato sub-system: Failed to deleted usage details for ato:", id)
	}
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	return nil
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	atos, err := c.List()
	if err != nil {
		return false, err
	}
	for _, a := range atos {
		if a.Pump == id {
			return true, nil
		}
	}
	return false, nil
}

func (c *Controller) Check(a ATO) {
	if !a.Enable {
		return
	}
	usage := Usage{
		Time: utils.TeleTime(time.Now()),
	}
	reading, err := c.Read(a)
	if err != nil {
		log.Println("ERROR: ato sub-system. Failed to read ato sensor. Error:", err)
		return
	}
	log.Println("ato sub-system:  sensor", a.Name, "value:", reading)
	c.telemetry.EmitMetric("ato", reading)
	if a.Control {
		if err := c.Control(a, reading); err != nil {
			log.Println("ERROR: Failed to execute ato control logic. Error:", err)
		}
		usage.Pump = int(a.Period)
		if reading == 1 {
			usage.Pump = 0
		}
	}
	c.NotifyIfNeeded(a, usage)
	c.statsMgr.Update(a.ID, usage)
}

func (c *Controller) Run(a ATO, quit chan struct{}) {
	if a.Period <= 0 {
		log.Printf("ERROR: ato sub-system. Invalid period set for sensor:%s. Expected postive, found:%d\n", a.Name, a.Period)
		return
	}
	ticker := time.NewTicker(a.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			c.Check(a)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) Read(a ATO) (int, error) {
	if c.devMode {
		v := 0
		if rand.Int()%2 == 0 {
			v = 1
		}
		return v, nil
	}
	return c.inlets.Read(a.Inlet)
}
