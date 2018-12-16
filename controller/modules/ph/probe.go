package ph

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/reef-pi/drivers"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Probe struct {
	ID      string        `json:"id"`
	Name    string        `json:"name"`
	Address int           `json:"address"`
	Enable  bool          `json:"enable"`
	Period  time.Duration `json:"period"`
	Config  ProbeConfig   `json:"config"`
}

func (c *Controller) Get(id string) (Probe, error) {
	var p Probe
	return p, c.controller.Store().Get(Bucket, id, &p)
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
	return probes, c.controller.Store().List(Bucket, fn)
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
	if err := c.controller.Store().Create(Bucket, fn); err != nil {
		return err
	}
	m := Measurement{
		Time: telemetry.TeleTime(time.Now()),
		len:  1,
	}
	c.statsMgr.Update(p.ID, m)
	if p.Enable {
		p.CreateFeed(c.controller.Telemetry())
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
	if err := c.controller.Store().Update(Bucket, id, p); err != nil {
		return err
	}
	quit, ok := c.quitters[p.ID]
	if ok {
		close(quit)
		delete(c.quitters, p.ID)
	}
	if p.Enable {
		p.CreateFeed(c.controller.Telemetry())
		quit := make(chan struct{})
		c.quitters[p.ID] = quit
		go c.Run(p, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.controller.Store().Delete(Bucket, id); err != nil {
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

func (c *Controller) Run(p Probe, quit chan struct{}) {
	if p.Period <= 0 {
		log.Printf("ERROR:ph sub-system. Invalid period set for probe:%s. Expected positive, found:%d\n", p.Name, p.Period)
		return
	}
	p.CreateFeed(c.controller.Telemetry())
	d := drivers.NewAtlasEZO(byte(p.Address), c.bus)
	ticker := time.NewTicker(p.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			reading := telemetry.TwoDecimal(8 + rand.Float64()*2)
			if !c.config.DevMode {
				v, err := d.Read()
				if err != nil {
					log.Println("ph sub-system: ERROR: Failed to read probe:", p.Name, ". Error:", err)
					continue
				}
				reading = v
			}
			log.Println("ph sub-system: Probe:", p.Name, "Reading:", reading)
			notifyIfNeeded(c.controller.Telemetry(), p, reading)
			m := Measurement{
				Time: telemetry.TeleTime(time.Now()),
				Ph:   reading,
				len:  1,
				sum:  reading,
			}
			c.statsMgr.Update(p.ID, m)
			c.controller.Telemetry().EmitMetric("ph-"+p.Name, reading)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}

type CalibrationDetails struct {
	Value float32 `json:"value"`
	Type  string  `json:"type"`
}

func (c *Controller) Calibrate(id string, details CalibrationDetails) error {
	if details.Value > 14 || details.Value <= 0 {
		return fmt.Errorf("Invalid calibration value %f. Valid values are above 0  and below 14", details.Value)
	}
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	if p.Enable {
		return fmt.Errorf("Probe must be disabled from automatic polling before running calibration")
	}
	d := drivers.NewAtlasEZO(byte(p.Address), c.bus)
	switch details.Type {
	case "high":
		return d.CalibrateHigh(details.Value)
	case "mid":
		return d.CalibrateMid(details.Value)
	case "low":
		return d.CalibrateLow(details.Value)
	default:
		return fmt.Errorf("Invalid calibration type: %s. Valid types are 'high', 'mid' ir 'low'", details.Type)
	}
}

func (p Probe) CreateFeed(t telemetry.Telemetry) {
	t.CreateFeedIfNotExist("ph-" + p.Name)
}
