package ph

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/hal"
	"log"
	"math/rand"
	"time"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Notify struct {
	Enable bool    `json:"enable"`
	Min    float64 `json:"min"`
	Max    float64 `json:"max"`
}

type Probe struct {
	ID          string        `json:"id"`
	Name        string        `json:"name"`
	Enable      bool          `json:"enable"`
	Period      time.Duration `json:"period"`
	AnalogInput string        `json:"analog_input"`
	Control     bool          `json:"control"`
	Notify      Notify        `json:"notify"`
}

func (c *Controller) Get(id string) (Probe, error) {
	var p Probe
	return p, c.c.Store().Get(Bucket, id, &p)
}

func (c Controller) List() ([]Probe, error) {
	probes := []Probe{}
	fn := func(v []byte) error {
		var p Probe
		if err := json.Unmarshal(v, &p); err != nil {
			return err
		}
		probes = append(probes, p)
		return nil
	}
	return probes, c.c.Store().List(Bucket, fn)
}

func (c *Controller) Create(p Probe) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if p.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied: %d", p.Period)
	}
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}
	m := Measurement{
		Time: telemetry.TeleTime(time.Now()),
		len:  1,
	}
	c.statsMgr.Update(p.ID, m)
	if p.Enable {
		p.CreateFeed(c.c.Telemetry())
		quit := make(chan struct{})
		c.quitters[p.ID] = quit
		go c.Run(p, quit)
	}
	return nil
}

func (c *Controller) Update(id string, p Probe) error {
	p.ID = id
	if p.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied: %d", p.Period)
	}
	if err := c.c.Store().Update(Bucket, id, p); err != nil {
		return err
	}
	quit, ok := c.quitters[p.ID]
	if ok {
		close(quit)
		delete(c.quitters, p.ID)
	}
	if p.Enable {
		p.CreateFeed(c.c.Telemetry())
		quit := make(chan struct{})
		c.quitters[p.ID] = quit
		go c.Run(p, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := c.statsMgr.Delete(id); err != nil {
		log.Println("ERROR: ph sub-system: Failed to deleted readings for probe:", id)
	}
	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	return nil
}

func (c *Controller) Read(p Probe) (float64, error) {
	if c.devMode {
		return telemetry.TwoDecimal(8 + rand.Float64()*2), nil
	}
	return c.ais.Read(p.AnalogInput)
}

func (c *Controller) Run(p Probe, quit chan struct{}) {
	if p.Period <= 0 {
		log.Printf("ERROR:ph sub-system. Invalid period set for probe:%s. Expected positive, found:%d\n", p.Name, p.Period)
		return
	}
	p.CreateFeed(c.c.Telemetry())
	ticker := time.NewTicker(p.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			reading, err := c.Read(p)
			if err != nil {
				log.Println("ph sub-system: ERROR: Failed to read probe:", p.Name, ". Error:", err)
				c.c.LogError("ph-"+p.ID, "ph subsystem: Failed read probe:"+p.Name+"Error:"+err.Error())
				continue
			}
			log.Println("ph sub-system: Probe:", p.Name, "Reading:", reading)
			notifyIfNeeded(c.c.Telemetry(), p, reading)
			m := Measurement{
				Time: telemetry.TeleTime(time.Now()),
				Ph:   reading,
				len:  1,
				sum:  reading,
			}
			c.statsMgr.Update(p.ID, m)
			c.c.Telemetry().EmitMetric("ph", p.Name, reading)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) Calibrate(id string, ms []hal.Measurement) error {
	for _, m := range ms {
		if m.Expected > 14 || m.Expected <= 0 {
			return fmt.Errorf("Invalid expected calibration value %f. Valid values are above 0  and below 14", m.Expected)
		}
		if m.Observed > 14 || m.Observed <= 0 {
			return fmt.Errorf("Invalid observed calibration value %f. Valid values are above 0  and below 14", m.Observed)
		}
	}
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	if p.Enable {
		return fmt.Errorf("Probe must be disabled from automatic polling before running calibration")
	}
	if err := c.c.Store().Update(CalibrationBucket, p.ID, ms); err != nil {
		return err
	}
	return c.ais.Calibrate(p.AnalogInput, ms)
}

func (p Probe) CreateFeed(t telemetry.Telemetry) {
	t.CreateFeedIfNotExist("ph-" + p.Name)
}
