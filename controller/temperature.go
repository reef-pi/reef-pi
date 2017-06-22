package controller

import (
	"log"
	"time"
)

type TemperatureSensor struct {
	Channel   int `json:"channel"`
	hours     []int
	minutes   []int
	stopCh    chan struct{}
	adc       *ADC
	telemetry *Telemetry
}

func NewTemperatureSensor(channel int, adc *ADC, telemetry *Telemetry) *TemperatureSensor {
	return &TemperatureSensor{
		Channel:   channel,
		hours:     make([]int, 24),
		minutes:   make([]int, 60),
		adc:       adc,
		telemetry: telemetry,
	}
}

func (t *TemperatureSensor) Hours() []int {
	return t.hours
}

func (t *TemperatureSensor) Minutes() []int {
	return t.minutes
}

func (t *TemperatureSensor) Start() {
	log.Println("Starting temperature sensor")
	hourly := time.NewTicker(time.Hour)
	minutely := time.NewTicker(time.Minute)
	for {
		select {
		case <-minutely.C:
			reading, err := t.adc.Read(t.Channel)
			if err != nil {
				log.Println("ERROR: Failed to ADC on channel", t.Channel, "Error:", err)
				continue
			}
			log.Println("Temperature sensor value:", reading)
			t.telemetry.EmitMetric("temperature", reading)
			t.minutes[time.Now().Minute()] = reading
		case <-hourly.C:
			reading, err := t.adc.Read(t.Channel)
			if err != nil {
				log.Println("ERROR: Failed to ADC on channel", t.Channel, "Error:", err)
				continue
			}
			t.telemetry.EmitMetric("temperature", reading)
			t.hours[time.Now().Hour()] = reading
		case <-t.stopCh:
			log.Println("Stopping temperature sensor")
			hourly.Stop()
			minutely.Stop()
			return
		}
	}
}

func (t *TemperatureSensor) Stop() {
	t.stopCh <- struct{}{}
}

func (c *Controller) GetTemperature() (readings []int) {
	if c.config.EnableTemperatureSensor {
		readings = c.state.tSensor.Minutes()
	}
	return
}
