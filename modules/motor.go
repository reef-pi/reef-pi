package modules

import (
	log "github.com/Sirupsen/logrus"
	"github.com/hybridgroup/gobot/platforms/gpio"
	"github.com/hybridgroup/gobot/platforms/raspi"
	"time"
)

type PeristalticPump struct {
	PWMPin   string `yaml:"pwm_pin"`
	IN1Pin   string `yaml:"in1_pin"`
	IN2Pin   string `yaml:"in2_pin"`
	On       bool   `yaml:"on"`
	motor    *gpio.MotorDriver
	Interval time.Duration `yaml:"interval"`
	Duration time.Duration `yaml:"duration"`
}

func (p *PeristalticPump) Start() error {
	r := raspi.NewRaspiAdaptor("raspi")
	p.motor = gpio.NewMotorDriver(r, "PeristalticPump", p.PWMPin)
	log.Infof("Running peristaltic pump  after every %d seconds for %d seconds", p.Interval, p.Duration)
	if err := p.motor.Max(); err != nil {
		log.Errorln("Failed to set max speed on motor. Error:", err)
		return err
	}
	in1_pin := gpio.NewDirectPinDriver(r, "in1_pin", p.IN1Pin)
	if err := in1_pin.DigitalWrite(byte(1)); err != nil {
		log.Errorln("Failed to turn on in1 pin. Error:", err)
		return err
	}
	in2_pin := gpio.NewDirectPinDriver(r, "in2_pin", p.IN2Pin)
	if err := in2_pin.DigitalWrite(byte(0)); err != nil {
		log.Errorln("Failed to turn off in2 pin. Error:", err)
		return err
	}
	for {
		time.Sleep(time.Second * p.Interval)
		if err := p.motor.On(); err != nil {
			log.Errorln("Failed to switch on motor. Error:", err)
			return err
		}
		log.Info("Motor turned on")
		time.Sleep(time.Second * p.Duration)
		if err := p.motor.Off(); err != nil {
			log.Errorln("Failed to switch off motor. Error:", err)
			return err
		}
		log.Info("Motor turned off")
	}
	return nil
}
