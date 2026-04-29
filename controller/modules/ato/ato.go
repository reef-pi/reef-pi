package ato

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Notify struct {
	Enable bool `json:"enable"`
	Max    int  `json:"max"`
}

// swagger:model ato
type ATO struct {
	ID             string        `json:"id"`
	IsMacro        bool          `json:"is_macro"`
	Inlet          string        `json:"inlet"`
	Pump           string        `json:"pump"`
	Period         time.Duration `json:"period"`
	Debounce       time.Duration `json:"debounce"`
	Control        bool          `json:"control"`
	Enable         bool          `json:"enable"`
	Notify         Notify        `json:"notify"`
	Name           string        `json:"name"`
	DisableOnAlert bool          `json:"disable_on_alert"`
	OneShot        bool          `json:"one_shot"`
}

func (a ATO) EName() string                { return a.Name }
func (a ATO) Status() (interface{}, error) { return ATO{}, nil }

func (c *Controller) On(id string, b bool) error {
	a, err := c.Get(id)
	if err != nil {
		return err
	}
	a.Enable = b
	if b && a.OneShot {
		q := make(chan struct{})
		defer close(q)
		return c.Run(a, q)
	}
	return c.Update(id, a)
}

func (c *Controller) Get(id string) (ATO, error) {
	return c.repo.Get(id)
}
func (c *Controller) List() ([]ATO, error) {
	return c.repo.List()
}

func (c *Controller) Create(a ATO) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Period <= 0 {
		return fmt.Errorf("Check period for ato controller must be greater than zero")
	}
	var err error
	a, err = c.repo.Create(a)
	if err != nil {
		return err
	}
	c.statsMgr.Initialize(a.ID)
	if a.Enable {
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		c.wg.Add(1)
		go func(ato ATO, q chan struct{}) {
			defer c.wg.Done()
			c.Run(ato, q)
		}(a, quit)
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
	if err := c.repo.Update(id, a); err != nil {
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
		c.wg.Add(1)
		go func(ato ATO, q chan struct{}) {
			defer c.wg.Done()
			c.Run(ato, q)
		}(a, quit)
	}
	return nil
}
func (c *Controller) Reset(id string) error {
	a, err := c.Get(id)
	if err != nil {
		return err
	}
	log.Println("ato-subsystem: resetting ato ", a.Name)
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	if err := c.statsMgr.Delete(id); err != nil {
		log.Println("ERROR:  ato-subsystem: Failed to deleted usage details for ato:", id, "error:", err)
	}
	if err := c.repo.DeleteUsage(id); err != nil {
		log.Println("ERROR:  ato-subsystem: Failed to deleted usage details for ato:", id, "error:", err)
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if a.Enable {
		quit := make(chan struct{})
		c.quitters[a.ID] = quit
		go c.Run(a, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.repo.Delete(id); err != nil {
		return err
	}
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	return nil
}

func (c *Controller) Check(a ATO) (int, error) {
	if !a.Enable {
		return 0, nil
	}
	usage := Usage{
		Time: telemetry.TeleTime(time.Now()),
	}
	reading, err := c.Read(a)
	if err != nil {
		log.Println("ERROR: ato-subsystem. Failed to read ato sensor. Error:", err)
		c.c.LogError("ato-"+a.ID, "Failed to read ato sensor. Name:"+a.Name+". Error:"+err.Error())
		return 0, err
	}
	c.c.Telemetry().EmitMetric("ato", a.Name+"-state", float64(reading))
	log.Println("ato-subsystem: sensor:", a.Name, "state:", reading)
	if a.Control {
		shouldControl := true
		if a.Debounce > 0 && reading == 0 {
			c.mu.Lock()
			ls, ok := c.lowSince[a.ID]
			if !ok || ls == nil {
				now := time.Now()
				c.lowSince[a.ID] = &now
				shouldControl = false
			} else if time.Since(*ls) < a.Debounce*time.Second {
				shouldControl = false
			}
			c.mu.Unlock()
		} else if reading == 1 {
			c.mu.Lock()
			c.lowSince[a.ID] = nil
			c.mu.Unlock()
		}
		if shouldControl {
			if err := c.Control(a, reading); err != nil {
				log.Println("ERROR: Failed to execute ato control logic. Error:", err)
			}
		}
		usage.Pump = int(a.Period)
		if reading == 1 {
			usage.Pump = 0
		}
	}
	c.statsMgr.Update(a.ID, usage)
	c.NotifyIfNeeded(a, reading)
	return reading, nil
}

func (c *Controller) Run(a ATO, quit chan struct{}) error {
	if a.Period <= 0 {
		log.Printf("ERROR: ato-subsystem. Invalid period set for sensor:%s. Expected positive, found:%d\n", a.Name, a.Period)
		return fmt.Errorf("invalid check period:%d", a.Period)
	}
	a.CreateFeed(c.c.Telemetry())
	ticker := time.NewTicker(a.Period * time.Second)
	defer func() {
		if r := recover(); r != nil {
			log.Printf("ERROR: ato-subsystem. Panic in Run goroutine for sensor:%s: %v\n", a.Name, r)
			c.c.LogError("ato-"+a.ID, fmt.Sprintf("ato controller goroutine panicked: %v", r))
		}
	}()
	defer ticker.Stop()
	defer func() {
		if r := recover(); r != nil {
			log.Printf("ERROR: ato-subsystem. Panic in Run goroutine for sensor:%s: %v\n", a.Name, r)
			c.c.LogError("ato-"+a.ID, fmt.Sprintf("ato controller goroutine panicked: %v", r))
		}
	}()
	for {
		select {
		case <-ticker.C:
			reading, err := c.Check(a)
			if a.OneShot {
				if err != nil {
					return err
				}
				// With pump control: disable once tank is full (reading==1)
				// Without pump control (Nothing): disable once low level detected (reading==0)
				if (a.Control && reading == 1) || (!a.Control && reading == 0) {
					a.Enable = false
					return c.Update(a.ID, a)
				}
			}
		case <-quit:
			// turn off pump on quit only when a pump is configured
			if a.Control && a.Pump != "" {
				return c.Control(a, 1)
			}
			return nil
		}
	}
}

func (c *Controller) Read(a ATO) (int, error) {
	return c.inlets.Read(a.Inlet)
}

func (a ATO) CreateFeed(t telemetry.Telemetry) {
	if a.Enable {
		t.CreateFeedIfNotExist("ato-" + a.Name + "-state")
	}
	if a.Pump != "" {
		t.CreateFeedIfNotExist("ato-" + a.Name + "-usage")
	}
}
