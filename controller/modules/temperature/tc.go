package temperature

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type ChartConfig struct {
	YMin  float64 `json:"ymin"`
	YMax  float64 `json:"ymax"`
	Color string  `json:"color"`
}

type Notify struct {
	Enable bool    `json:"enable"`
	Max    float64 `json:"max"`
	Min    float64 `json:"min"`
}

//swagger:model temperatureController
// *** added ChartYMax, ChartYMin - JFR 20201110
// *** removed above after upstream changes - JFR 20210111
type TC struct {
	sync.Mutex
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Max          float64       `json:"max"`
	Min          float64       `json:"min"`
	Hysteresis   float64       `json:"hysteresis"`
	Heater       string        `json:"heater"`
	Cooler       string        `json:"cooler"`
	Period       time.Duration `json:"period"`
	Control      bool          `json:"control"`
	Enable       bool          `json:"enable"`
	Notify       Notify        `json:"notify"`
	Sensor       string        `json:"sensor"`
	Fahrenheit   bool          `json:"fahrenheit"`
	IsMacro      bool          `json:"is_macro"`
	OneShot      bool          `json:"one_shot"`
	Chart        ChartConfig   `json:"chart"`
	h            *controller.Homeostasis
	currentValue float64
	calibrator   hal.Calibrator
}

func (t *TC) loadHomeostasis(c controller.Controller) {
	t.Lock()
	defer t.Unlock()
	hConf := controller.HomeoStasisConfig{
		Name:       t.Name,
		Upper:      t.Heater,
		Downer:     t.Cooler,
		Min:        t.Min,
		Max:        t.Max,
		Period:     int(t.Period),
		Hysteresis: t.Hysteresis,
		IsMacro:    t.IsMacro,
	}
	t.h = controller.NewHomeostasis(c, hConf)
}

func (c *Controller) Get(id string) (*TC, error) {
	c.Lock()
	tc, ok := c.tcs[id]
	defer c.Unlock()
	if !ok {
		return nil, fmt.Errorf("temperature controller with id '%s' is not present", id)
	}
	return tc, nil
}

func (c *Controller) List() ([]*TC, error) {
	tcs := []*TC{}
	fn := func(_ string, v []byte) error {
		var tc TC
		if err := json.Unmarshal(v, &tc); err != nil {
			return err
		}
		tcs = append(tcs, &tc)
		return nil
	}
	return tcs, c.c.Store().List(Bucket, fn)
}

func (c *Controller) Create(tc *TC) error {
	c.Lock()
	defer c.Unlock()
	if tc.Period <= 0 {
		return fmt.Errorf("Check period for temperature controller must be greater than zero")
	}
	fn := func(id string) interface{} {
		tc.ID = id
		return tc
	}
	if err := c.c.Store().Create(Bucket, fn); err != nil {
		return err
	}

	c.tcs[tc.ID] = tc
	c.statsMgr.Initialize(tc.ID)
	if tc.Enable {
		quit := make(chan struct{})
		c.quitters[tc.ID] = quit
		go c.Run(tc, quit)
	}
	return nil
}

func (c *Controller) Update(id string, tc *TC) error {
	c.Lock()
	defer c.Unlock()
	tc.ID = id
	if tc.Period <= 0 {
		return fmt.Errorf("Period should be positive. Supplied:%d", tc.Period)
	}
	if err := c.c.Store().Update(Bucket, id, tc); err != nil {
		return err
	}
	quit, ok := c.quitters[tc.ID]
	if ok {
		close(quit)
		delete(c.quitters, tc.ID)
	}

	c.tcs[tc.ID] = tc
	if tc.Enable {
		quit := make(chan struct{})
		c.quitters[tc.ID] = quit
		go c.Run(tc, quit)
	}
	return nil
}

func (c *Controller) Delete(id string) error {
	tc, err := c.Get(id)
	if err != nil {
		return err
	}

	tcs, err := c.List()
	if err != nil {
		return err
	}

	deleteCalibration := true
	for _, t := range tcs {
		if t.ID != tc.ID && t.Sensor == tc.Sensor {
			deleteCalibration = false
		}
	}
	c.Lock()
	defer c.Unlock()

	if deleteCalibration {

		c.c.Store().Delete(CalibrationBucket, tc.Sensor)
		delete(c.calibrators, tc.Sensor)
	}

	if err := c.c.Store().Delete(Bucket, id); err != nil {
		return err
	}
	if err := c.c.Store().Delete(UsageBucket, id); err != nil {
		log.Println("ERROR:  temperature sub-system: Failed to delete usage details for sensor:", id)
	}

	quit, ok := c.quitters[id]
	if ok {
		close(quit)
		delete(c.quitters, id)
	}
	delete(c.tcs, id)
	return nil
}

func (c *Controller) IsEquipmentInUse(id string) (bool, error) {
	c.Lock()
	defer c.Unlock()
	tcs, err := c.List()
	if err != nil {
		return false, err
	}
	for _, tc := range tcs {
		if tc.Heater == id {
			return true, nil
		}
		if tc.Cooler == id {
			return true, nil
		}
	}
	return false, nil
}

func (c *Controller) Run(t *TC, quit chan struct{}) error {
	t.CreateFeed(c.c.Telemetry())
	if t.Period <= 0 {
		log.Printf("ERROR: temperature sub-system. Invalid period set for sensor:%s. Expected positive, found:%d\n", t.Name, t.Period)
		return nil
	}
	ticker := time.NewTicker(t.Period * time.Second)
	t.loadHomeostasis(c.c)
	for {
		select {
		case <-ticker.C:
			reading, err := c.Check(t)
			if t.OneShot {
				if err != nil {
					return err
				}
				if t.WithinRange(reading) {
					t.SetEnable(false)
					return c.Update(t.ID, t)
				}
			}
		case <-quit:
			ticker.Stop()
			return nil
		}
	}
}

func (tc *TC) SetEnable(b bool) {
	tc.Lock()
	defer tc.Unlock()
	tc.Enable = b
}

func (tc *TC) CreateFeed(telemetry telemetry.Telemetry) {
	tc.Lock()
	defer tc.Unlock()
	if !tc.Enable {
		return
	}
	telemetry.CreateFeedIfNotExist(tc.Name + "-reading")
	if !tc.Control {
		return
	}
	if tc.Heater != "" {
		telemetry.CreateFeedIfNotExist(tc.Name + "-heater")
	}
	if tc.Cooler != "" {
		telemetry.CreateFeedIfNotExist(tc.Name + "-cooler")
	}
}

func (c *Controller) Calibrate(id string, ms []hal.Measurement) error {
	tc, err := c.Get(id)
	if err != nil {
		return err
	}
	cal, err := hal.CalibratorFactory(ms)
	if err != nil {
		return err
	}
	c.Lock()
	defer c.Unlock()

	c.calibrators[tc.Sensor] = cal
	return c.c.Store().Update(CalibrationBucket, tc.Sensor, ms)
}

func (t *TC) WithinRange(v float64) bool {
	return v >= t.Min && v <= t.Max
}
