package controller

import (
	"github.com/kidoman/embd"
	"github.com/ranjib/reef-pi/controller/lighting"
	"log"
)

type State struct {
	pwm       *PWM // Pulse Width Modulation (LED bringhtiness, DC pump speed)
	adc       *ADC // Analog to digital converter (sensors)
	lighting  *Lighting
	atos      map[string]*ATO
	tSensor   *TemperatureSensor
	telemetry *Telemetry
	config    Config
	store     *Store
}

func NewState(c Config, store *Store, telemetry *Telemetry) *State {
	return &State{
		atos:      make(map[string]*ATO),
		config:    c,
		store:     store,
		telemetry: telemetry,
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
		s.tSensor = NewTemperatureSensor(s.config.TemperaturePin, s.adc, s.telemetry)
		go s.tSensor.Start()
		log.Println("Enabled temperature senosor subsystem")
	}
	if s.config.EnablePWM {
		p, err := NewPWM(s.config.DevMode)
		if err != nil {
			log.Println("ERROR: Failed to initialize pwm system")
			return err
		}
		s.pwm = p
		s.pwm.Start()
		log.Println("Enabled PWM subsystem")
	}
	if s.config.EnablePWM && s.config.Lighting.Enabled {
		lConfig := lighting.DefaultConfig
		if err := s.store.Get(LightingBucket, "config", &lConfig); err != nil {
			log.Println("No existing lighting settings found. Resetting")
			if lErr := s.store.Update(LightingBucket, "config", lConfig); lErr != nil {
				log.Println("Failied to initalize lighting subsystem")
				return err
			}
		}
		s.lighting = NewLighting(s.config.Lighting.Channels)
		s.lighting.Reconfigure(s.pwm, lConfig)
		log.Println("Successfully initialized lighting subsystem")
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
	if s.config.Lighting.Enabled {
		s.lighting.StopCycle()
	}
}
