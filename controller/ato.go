package controller

import (
	"encoding/json"
	"fmt"
	"github.com/kidoman/embd"
	_ "github.com/kidoman/embd/host/rpi"
	"log"
	"time"
)

const (
	ATOCONFIG_BUKET = "ato_configs"
)

type ATOConfig struct {
	ID        string        `json:"id"`
	Name      string        `json:"name"`
	SensorPin int           `json:"sensor_pin"`
	PumpPin   int           `json:"pump_pin"`
	Frequency time.Duration `json:"frequency"`
	HighRelay bool          `json:"high_relay"`
}

func (c *Controller) GetATOConfig(id string) (ATOConfig, error) {
	var config ATOConfig
	return config, c.store.Get(ATOCONFIG_BUKET, id, &config)
}

func (c *Controller) ListATOConfigs() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var config ATOConfig
		return &config, json.Unmarshal(v, &config)
	}
	return c.store.List(ATOCONFIG_BUKET, fn)
}

func (c *Controller) CreateATOConfig(config ATOConfig) error {
	fn := func(id string) interface{} {
		config.ID = id
		return config
	}
	return c.store.Create(ATOCONFIG_BUKET, fn)
}

func (c *Controller) UpdateATOConfig(id string, payload ATOConfig) error {
	return c.store.Update(ATOCONFIG_BUKET, id, payload)
}

func (c *Controller) DeleteATOConfig(id string) error {
	return c.store.Delete(ATOCONFIG_BUKET, id)
}

type ATO struct {
	sensor      embd.DigitalPin
	pump        embd.DigitalPin
	Frequency   time.Duration
	config      ATOConfig
	stopCh      chan struct{}
	pumpRunning bool
	running     bool
}

func NewATO(config ATOConfig) (*ATO, error) {
	sensor, err := embd.NewDigitalPin(config.SensorPin)
	if err != nil {
		return nil, err
	}
	if err := sensor.SetDirection(embd.In); err != nil {
		return nil, err
	}
	pump, err := embd.NewDigitalPin(config.PumpPin)
	if err != nil {
		return nil, err
	}
	if err := pump.SetDirection(embd.Out); err != nil {
		return nil, err
	}
	return &ATO{
		sensor: sensor,
		pump:   pump,
		stopCh: make(chan struct{}),
		config: config,
	}, nil
}

func (a *ATO) Start() {
	if a.running {
		log.Println("ATO is already running")
	}
	go a.run()
	a.running = true
}

func (a *ATO) IsRunning() bool {
	return a.running
}

func (a *ATO) run() {
	ticker := time.NewTicker(a.config.Frequency * time.Second)
	log.Println("Starting ATO:", a.config.Name)
	for {
		select {
		case <-ticker.C:
			a.do()
		case <-a.stopCh:
			log.Println("Stopping ATO:", a.config.Name)
			a.stopPump()
			a.closePins()
			ticker.Stop()
			return
		}
	}
}

func (a *ATO) do() {

	tripped, err := a.IsTripped()
	if err != nil {
		log.Println("ERROR: Failed to read sensor data.", err)
		return
	}
	log.Println("ATO:", a.config.Name, "Tripped:", tripped)
	if tripped {
		if err := a.startPump(); err != nil {
			log.Println("ERROR: Failed to start ATO pump.", err)
		}
	} else {
		if err := a.stopPump(); err != nil {
			log.Println("ERROR: Failed to stop ATO pump.", err)
		}
	}
	return
}
func (a *ATO) Stop() {
	a.stopCh <- struct{}{}
	a.running = false
	return
}

func (a *ATO) closePins() {
	a.sensor.Close()
	a.pump.Close()
	return
}

func (a *ATO) startPump() error {
	if a.pumpRunning {
		return nil
	}
	state := embd.High
	log.Println("ATO:", a.config.Name, "starting pump")
	if a.config.HighRelay {
		state = embd.Low
	}
	if err := a.pump.Write(state); err != nil {
		return err
	}
	a.pumpRunning = true
	return nil
}

func (a *ATO) stopPump() error {
	if !a.pumpRunning {
		return nil
	}
	log.Println("ATO:", a.config.Name, "stopping pump")
	state := embd.Low
	if a.config.HighRelay {
		state = embd.High
	}
	if err := a.pump.Write(state); err != nil {
		return nil
	}
	a.pumpRunning = false
	return nil
}

func (a *ATO) IsTripped() (bool, error) {
	v, err := a.sensor.Read()
	if err != nil {
		return false, err
	}
	log.Println("ATO:", a.config.Name, "Sensor reading:", v)
	return v == 1, nil
}

func (c *Controller) StartATO(id string) error {
	_, ok := c.atos[id]
	if ok {
		return fmt.Errorf("ATO is already running")
	}
	config, err := c.GetATOConfig(id)
	if err != nil {
		return err
	}
	ato, err := NewATO(config)
	if err != nil {
		return err
	}
	c.atos[id] = ato
	go ato.Start()
	return nil
}

func (c *Controller) StopATO(id string) error {
	ato, ok := c.atos[id]
	if !ok {
		return fmt.Errorf("ATO is not loaded")
	}
	if !ato.IsRunning() {
		log.Println("ATO", ato.config.Name, " is already stopped")
		return nil
	}
	ato.Stop()
	delete(c.atos, id)
	return nil
}

func (c *Controller) StopAllATOs() {
	for _, ato := range c.atos {
		ato.Stop()
	}
}
