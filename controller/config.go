package controller

import (
	"github.com/kidoman/embd"
	_ "github.com/kidoman/embd/host/rpi"
	"log"
)

type Config struct {
	EnableGPIO              bool   `yaml:"enable_gpio"`
	EnablePWM               bool   `yaml:"enable_pwm"`
	EnableADC               bool   `yaml:"enable_adc"`
	EnableTemperatureSensor bool   `yaml:"enable_temperature_sensor"`
	HighRelay               bool   `yaml:"high_relay"`
	Database                string `yaml:"database"`
	TemperaturePin          int    `yaml:"temperature_pin"`
}

var DefaultConfig = Config{
	Database:       "reef-pi.db",
	EnableGPIO:     true,
	TemperaturePin: 0,
}

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
