package controller

import (
	"github.com/kidoman/embd"
	"log"
)

type State struct {
	pwm     *PWM // Pulse Width Modulation (LED bringhtiness, DC pump speed)
	adc     *ADC // Analog to digital converter (sensors)
	atos    map[string]*ATO
	tSensor *TemperatureSensor
	config  Config
}

func NewState(c Config) *State {
	return &State{
		atos:   make(map[string]*ATO),
		config: c,
	}
}

func (s *State) Bootup() error {
	if s.config.EnableGPIO {
		log.Println("Enabled GPIO subsystem")
		embd.InitGPIO()
	}
	if s.config.EnableADC {
		s.adc = NewADC()
		s.adc.Start()
		log.Println("Enabled ADC subsystem")
	}
	if s.config.EnableTemperatureSensor && s.config.EnableADC {
		s.tSensor = NewTemperatureSensor(s.config.TemperaturePin, s.adc)
		go s.tSensor.Start()
		log.Println("Enabled temperature senosor subsystem")
	}
	if s.config.EnablePWM {
		p, err := NewPWM()
		if err != nil {
			log.Println("ERROR: Failed to initialize pwm system")
			return err
		}
		s.pwm = p
		s.pwm.Start()
		log.Println("Enabled PWM subsystem")
	}
	return nil
}

func (s *State) TearDown() {
	if s.config.EnablePWM {
		s.pwm.Stop()
		s.pwm = nil
		log.Println("Stopped PWM subsystem")
	}
	if s.config.EnableADC {
		s.adc.Stop()
		s.adc = nil
		if s.config.EnableTemperatureSensor {
			s.tSensor.Stop()
			s.tSensor = nil
		}
		log.Println("Stopped ADC subsystem")
	}
	if s.config.EnableGPIO {
		embd.CloseGPIO()
		log.Println("Stopping GPIO subsystem")
	}
}
