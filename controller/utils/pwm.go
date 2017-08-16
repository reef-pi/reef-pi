package utils

import (
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/controller/pca9685"
)

type PWMConfig struct {
	Bus     int  `json:"bus"`     // 1
	Address int  `json:"address"` // 0x40
	DevMode bool `json:"dev_mode"`
}

type PWM struct {
	values map[int]int
	conn   *pca9685.PCA9685
	config PWMConfig
}

var DefaultPWMConfig = PWMConfig{
	Bus:     1,
	Address: 0x40,
}

func NewPWM(config PWMConfig) (*PWM, error) {
	var conn *pca9685.PCA9685
	if config.DevMode {
		bus := &DevI2CBus{}
		conn = pca9685.New(bus, byte(config.Address))
	} else {
		bus := embd.NewI2CBus(byte(config.Bus))
		conn = pca9685.New(bus, byte(config.Address))
	}
	pwm := PWM{
		values: make(map[int]int),
		conn:   conn,
		config: config,
	}
	return &pwm, nil
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
	if p.config.DevMode {
		return nil
	}
	return embd.CloseI2C()
}
