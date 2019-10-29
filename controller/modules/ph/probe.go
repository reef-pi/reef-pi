package ph

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

const ReadingsBucket = storage.PhReadingsBucket

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
	UpperEq     string        `json:"upper_eq"`
	DownerEq    string        `json:"downer_eq"`
	Min         float64       `json:"min"`
	Max         float64       `json:"max"`
	Hysteresis  float64       `json:"hysteresis"`
	IsMacro     bool          `json:"is_macro"`
	h           *controller.Homeostasis
}

func (p *Probe) loadHomeostasis(c controller.Controller) {
	hConf := controller.HomeoStasisConfig{
		Name:       p.Name,
		Upper:      p.UpperEq,
		Downer:     p.DownerEq,
		Min:        p.Min,
		Max:        p.Max,
		Period:     int(p.Period),
		IsMacro:    p.IsMacro,
		Hysteresis: p.Hysteresis,
	}
	p.h = controller.NewHomeostasis(c, hConf)
}

type CalibrationPoint struct {
	Type     string  `json:"type"`
	Expected float64 `json:"expected"`
	Observed float64 `json:"observed"`
}

func (c *Controller) Get(id string) (Probe, error) {
	var p Probe
	return p, c.c.Store().Get(Bucket, id, &p)
}

func (c Controller) List() ([]Probe, error) {
	probes := []Probe{}
	fn := func(_ string, v []byte) error {
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
	if p.Control {
		p.loadHomeostasis(c.c)
	}
	p.CreateFeed(c.c.Telemetry())
	ticker := time.NewTicker(p.Period * time.Second)
	for {
		select {
		case <-ticker.C:
			c.checkAndControl(p)
		case <-quit:
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) checkAndControl(p Probe) {
	reading, err := c.Read(p)
	if err != nil {
		log.Println("ph sub-system: ERROR: Failed to read probe:", p.Name, ". Error:", err)
		c.c.LogError("ph-"+p.ID, "ph subsystem: Failed read probe:"+p.Name+"Error:"+err.Error())
		return
	}
	var calibrator hal.Calibrator
	var ms []hal.Measurement
	if err := c.c.Store().Get(CalibrationBucket, p.ID, &ms); err == nil {
		cal, err := hal.CalibratorFactory(ms)
		if err != nil {
			log.Println("ERROR: ph-subsystem: Failed to create calibration function for probe:", p.Name, "Error:", err)
		} else {
			calibrator = cal
		}
	}
	if calibrator != nil {
		reading = calibrator.Calibrate(reading)
	}
	log.Println("ph sub-system: Probe:", p.Name, "Reading:", reading)
	notifyIfNeeded(c.c.Telemetry(), p, reading)
	u := controller.NewObservation(reading)
	if p.Control {
		if err := p.h.Sync(&u); err != nil {
			log.Println("ERROR: Failed to execute ph control logic. Error:", err)
		}
	}
	c.statsMgr.Update(p.ID, u)
	c.c.Telemetry().EmitMetric("ph", p.Name, reading)
}

func (c *Controller) Calibrate(id string, ms []hal.Measurement) error {
	for _, m := range ms {
		if m.Expected > 14 || m.Expected <= 0 {
			return fmt.Errorf("Invalid expected calibration value %f. Valid values are above 0  and below 14", m.Expected)
		}
	}
	p, err := c.Get(id)
	if err != nil {
		return err
	}
	if p.Enable {
		return fmt.Errorf("Probe must be disabled from automatic polling before running calibration")
	}
	return c.c.Store().Update(CalibrationBucket, p.ID, ms)
}

func (c *Controller) CalibratePoint(id string, point CalibrationPoint) error {
	if point.Expected > 14 || point.Expected <= 0 {
		return fmt.Errorf("Invalid expected calibration value %f. Valid values are above 0  and below 14", point.Expected)
	}

	p, err := c.Get(id)
	if err != nil {
		return err
	}
	if p.Enable {
		return fmt.Errorf("Probe must be disabled from automatic polling before running calibration")
	}

	var calibration []hal.Measurement

	//Append to existing calibration unless the point is the mid point.
	//Receiving a mid point calibration resets the calibration process.
	if point.Type != "mid" {
		if err := c.c.Store().Get(CalibrationBucket, p.ID, &calibration); err != nil {
			log.Println("ph-subsystem. No calibration data found for probe:", p.Name)
		}
	}

	calibration = append(calibration, hal.Measurement{Expected: point.Expected, Observed: point.Observed})

	return c.c.Store().Update(CalibrationBucket, p.ID, calibration)
}

func (p Probe) CreateFeed(t telemetry.Telemetry) {
	t.CreateFeedIfNotExist("ph-" + p.Name)
}
func notifyIfNeeded(t telemetry.Telemetry, p Probe, reading float64) {
	if !p.Notify.Enable {
		return
	}
	subject := fmt.Sprintf("[Reef-Pi ALERT] ph of '%s' out of range", p.Name)
	format := "Current ph value from probe '%s' (%f) is out of acceptable range ( %f -%f )"
	body := fmt.Sprintf(format, reading, p.Name, p.Notify.Min, p.Notify.Max)
	if reading >= p.Notify.Max {
		t.Alert(subject, "Tank ph is high. "+body)
		return
	}
	if reading <= p.Notify.Min {
		t.Alert(subject, "Tank ph is low. "+body)
		return
	}
}
