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

type PWM interface {
	Start() error
	Stop() error
	Set(pin, percentage int) error
	Get(pin int) (int, error)
	On(pin int) error
	Off(pin int) error
}

type pca9685Driver struct {
	values map[int]int
	conn   *pca9685.PCA9685
	config PWMConfig
}

var DefaultPWMConfig = PWMConfig{
	Bus:     1,
	Address: 0x40,
}

func NewPWM(config PWMConfig) (PWM, error) {
	var bus embd.I2CBus
	if config.DevMode {
		bus = &DevI2CBus{}
	} else {
		bus = embd.NewI2CBus(byte(config.Bus))
	}
	pwm := pca9685Driver{
		values: make(map[int]int),
		conn:   pca9685.New(bus, byte(config.Address)),
		config: config,
	}
	return &pwm, pwm.Start()
}

func (p *pca9685Driver) Start() error {
	return p.conn.Wake()
}

// value should be within 0-99
func (p *pca9685Driver) Set(pin int, value int) error {
	off := int(float32(value) * 40.96)
	p.values[pin] = off
	return p.conn.SetPwm(pin, 0, off)
}

func (p *pca9685Driver) Get(pin int) (int, error) {
	return p.values[pin], nil
}

func (p *pca9685Driver) On(pin int) error {
	v, ok := p.values[pin]
	if !ok {
		v = 4095
		p.values[pin] = v
	}
	return p.conn.SetPwm(pin, 0, v)
}

func (p *pca9685Driver) Off(pin int) error {
	p.values[pin] = 0
	return p.conn.SetPwm(pin, 0, 0)
}

func (p *pca9685Driver) Stop() error {
	if err := p.conn.Close(); err != nil {
		return err
	}
	if p.config.DevMode {
		return nil
	}
	return embd.CloseI2C()
}
