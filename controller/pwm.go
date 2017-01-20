package controller

import (
	"fmt"
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/controller/pca9685"
	_ "github.com/kidoman/embd/host/rpi"
)

type PWMConfig struct {
	Bus     int `json:"bus"`     // 1
	Address int `json:"address"` // 0x40
}

type PWM struct {
	values map[int]int
	conn   *pca9685.PCA9685
}

func NewPWM() (*PWM, error) {
	c := PWMConfig{
		Bus:     1,
		Address: 0x40,
	}
	var err error
	defer func() {
		if r := recover(); r != nil {
			e, ok := r.(error)
			if !ok {
				err = fmt.Errorf("pkg: %v", r)
			} else {
				err = e
			}
		}
	}()
	bus := embd.NewI2CBus(byte(c.Bus))
	conn := pca9685.New(bus, byte(c.Address))
	pwm := PWM{
		values: make(map[int]int),
		conn:   conn,
	}
	return &pwm, err
}

func (p *PWM) Start() error {
	return p.conn.Wake()
}

// value should be within 0-99
func (p *PWM) Set(pin int, value int) error {
	off := int(float32(value) * 40.96)
	p.values[pin] = off
	return p.conn.SetPwm(pin, 0, off)
}

func (p *PWM) Get(pin int) int {
	return p.values[pin]
}

func (p *PWM) On(pin int) error {
	v, ok := p.values[pin]
	if !ok {
		v = 4095
		p.values[pin] = v
	}
	return p.conn.SetPwm(pin, 0, v)
}

func (p *PWM) Off(pin int) error {
	p.values[pin] = 0
	return p.conn.SetPwm(pin, 0, 0)
}

func (p *PWM) Stop() error {
	if err := p.conn.Close(); err != nil {
		return err
	}
	return embd.CloseI2C()
}
