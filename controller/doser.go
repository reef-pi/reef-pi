package controller

import (
	"gobot.io/x/gobot/drivers/gpio"
	"time"
)

type DoserConfig struct {
	Name   string `json:"name"`
	PWMPin string `json:"pwm"`
	IN1Pin string `json:"in1"`
	IN2Pin string `json:"in2"`
}

type Doser struct {
	config  *DoserConfig
	motor   *gpio.MotorDriver
	in1_pin *gpio.DirectPinDriver
	in2_pin *gpio.DirectPinDriver
}

func NewDoser(config DoserConfig, conn gpio.DigitalWriter) *Doser {
	d := &Doser{
		config:  &config,
		in1_pin: gpio.NewDirectPinDriver(conn, config.IN1Pin),
		in2_pin: gpio.NewDirectPinDriver(conn, config.IN2Pin),
		motor:   gpio.NewMotorDriver(conn, config.PWMPin),
	}
	return d
}

func (d *Doser) Type() string {
	return "doser"
}

func (d *Doser) Name() string {
	return d.config.Name
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
func (d *Doser) Config() interface{} {
	return d.config
}
