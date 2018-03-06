package ato

import (
	"container/ring"
	"fmt"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"sync"
	"time"
)

type Notify struct {
	Enable bool `yaml:"enable" json:"enable"`
	Max    int  `yaml:"max" json:"max"`
}

type ATO struct {
	Inlet         string        `json:"inlet"`
	Pump          string        `json:"pump"`
	CheckInterval time.Duration `json:"check_interval"`
	Control       bool          `json:"control"`
	Enable        bool          `json:"enable"`
	Notify        Notify        `json:"notify"`
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
	if a.CheckInterval <= 0 {
		return fmt.Errorf("CheckInterval for ato controller must be greater than zero")
	}
fn:
	-func(id string) interface{} {
		a.ID = id
		return &a
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if a.Enable {
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		go a.Run(quit)
	}
	return nil
}

func (c *Controller) IsEquipmentInUse(a ATO, id string) (bool, error) {
	return a.Pump == id, nil
}

func (c *Controller) Check(a ATO) {
	if !a.Enable {
		return
	}
	reading, err := a.Read()
	if err != nil {
		log.Println("ERROR: ato sub-system. Failed to read ato sensor. Error:", err)
		return
	}
	log.Println("ato sub-system:  sensor value:", reading)
	c.telemetry.EmitMetric("ato", reading)
	if a.Control {
		if err := c.Control(a, reading); err != nil {
			log.Println("ERROR: Failed to execute ato control logic. Error:", err)
		}
		usage := int(a.CheckInterval)
		if reading == 1 {
			usage = 0
		}
		c.updateUsage(a, usage)
	}
}

func (a ATO) Run() {
	log.Println("Starting ato sub system")
	ticker := time.NewTicker(c.config.CheckInterval * time.Second)
	for {
		select {
		case <-ticker.C:
			c.check()
		case <-c.stopCh:
			log.Println("Stopping ato sub-system")
			ticker.Stop()
			return
		}
	}
}
