package ph

import (
	"encoding/json"
	"github.com/reef-pi/drivers"
	"github.com/reef-pi/rpi/i2c"
	"log"
	"time"
)

type Probe struct {
	ID      string        `json:"id"`
	Name    string        `json:"name"`
	Address int           `json:"address"`
	Enable  bool          `json:"enable"`
	Period  time.Duration `json:"period"`
}

func (c *Controller) Get(id string) (Probe, error) {
	var p Probe
	return p, c.store.Get(Bucket, id, &p)
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
	return probes, c.store.List(Bucket, fn)
}

func (c *Controller) Create(p Probe) error {
	fn := func(id string) interface{} {
		p.ID = id
		return &p
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	if p.Enable {
		c.quitters[p.ID] = make(chan struct{})
		go p.Run(c.bus, c.quitters[p.ID], c.config.DevMode)
	}
	return nil
}

func (c *Controller) Update(id string, p Probe) error {
	p.ID = id
	if err := c.store.Update(Bucket, id, p); err != nil {
		return err
	}
	quit, ok := c.quitters[p.ID]
	if ok {
		close(quit)
		delete(c.quitters, p.ID)
	}
	if p.Enable {
		c.quitters[p.ID] = make(chan struct{})
		go p.Run(c.bus, c.quitters[p.ID], c.config.DevMode)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	if err := c.store.Delete(Bucket, id); err != nil {
		return err
	}
	close(c.quitters[id])
	delete(c.quitters, id)
	return nil
}

func (p Probe) Read(d *drivers.AtlasEZO) {
	v, err := d.Read()
	if err != nil {
		log.Println("ph sub-system: ERROR: Failed to read probe:", p.Name, ". Error:", err)
		return
	}
	log.Println("ph sub-system: Probe:", p.Name, "Reading:", v)
}

func (p Probe) Run(bus i2c.Bus, quit chan struct{}, devMode bool) {
	d := drivers.NewAtlasEZO(byte(p.Address), bus)
	ticker := time.NewTicker(p.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			if devMode {
				log.Println("ph subsysten: Running in devmode probe:", p.Name, "reading:", 10)
			} else {
				p.Read(d)
			}
		case <-quit:
			ticker.Stop()
			return
		}
	}
}
