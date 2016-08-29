package controller

import (
	"github.com/hybridgroup/gobot/platforms/gpio"
	"time"
)

type DoserConfig struct {
	PWMPin string `yaml:"pwm"`
	IN1Pin string `yaml:"in1"`
	IN2Pin string `yaml:"in2"`
}

type Doser struct {
	name    string
	motor   *gpio.MotorDriver
	in1_pin *gpio.DirectPinDriver
	in2_pin *gpio.DirectPinDriver
}

func NewDoser(name string, conn gpio.DigitalWriter, config DoserConfig) *Doser {
	d := &Doser{
		name:    name,
		in1_pin: gpio.NewDirectPinDriver(conn, "in1_pin", config.IN1Pin),
		in2_pin: gpio.NewDirectPinDriver(conn, "in2_pin", config.IN2Pin),
		motor:   gpio.NewMotorDriver(conn, "doser", config.PWMPin),
	}
	return d
}

func (d *Doser) Name() string {
	return d.name
}

func (d *Doser) On() error {
	return d.motor.On()
}

func (d *Doser) Off() error {
	return d.motor.Off()
}

func (d *Doser) Run(duration time.Duration, splay time.Duration) error {
	if err := d.motor.Off(); err != nil {
		return err
	}
	for {
		time.Sleep(time.Second * splay)
		if err := d.motor.On(); err != nil {
			return err
		}
		time.Sleep(time.Second * duration)
		if err := d.motor.Off(); err != nil {
			return err
		}
	}
	return nil
}

func (d *Doser) Forward() error {
	if err := d.in1_pin.DigitalWrite(byte(1)); err != nil {
		return err
	}
	return d.in2_pin.DigitalWrite(byte(0))
}

func (d *Doser) Reverse() error {
	if err := d.in1_pin.DigitalWrite(byte(0)); err != nil {
		return err
	}
	return d.in2_pin.DigitalWrite(byte(1))
}

func (d *Doser) Max() error {
	return d.motor.Max()
}
