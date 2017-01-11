package controller

import (
	"log"
	"math/rand"
	"time"
)

type TemperatureSensor struct {
	Channel  int         `json:"channel"`
	readings map[int]int `json:"readings"`
	stopCh   chan struct{}
	adc      *ADC
}

func NewTemperatureSensor(channel int, adc *ADC) *TemperatureSensor {
	readings := make(map[int]int)
	for i := 0; i < 24; i++ {
		readings[i] = 0
	}
	return &TemperatureSensor{
		Channel:  channel,
		readings: readings,
		adc:      adc,
	}
}

func (t *TemperatureSensor) Readings() []int {
	readings := []int{}
	for i := 0; i < 24; i++ {
		readings = append(readings, t.readings[i])
	}
	return readings

}

func (t *TemperatureSensor) Start() {
	log.Println("Starting temperature sensor")
	ticker := time.NewTicker(time.Hour)
	for {
		select {
		case <-ticker.C:
			h := time.Now().Hour()
			/*reading, err := t.adc.Read(t.Channel)
			if err != nil {
				log.Println("ERROR: Failed to ADC on channel", t.Channel, "Error:", err)
				continue
			}
			*/
			t.readings[h] = 30 + rand.Intn(10)
		case <-t.stopCh:
			log.Println("Stopping temperature sensor")
			ticker.Stop()
			return
		}
	}
}

func (t *TemperatureSensor) Stop() {
	t.stopCh <- struct{}{}
}

func (c *Controller) GetTemperature() []int {
	return c.temp.Readings()

}
