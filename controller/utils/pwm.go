package utils

import (
	"github.com/reef-pi/drivers"
	"github.com/reef-pi/rpi/i2c"
	"sync"
)

type PWMConfig struct {
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
	driver *drivers.PCA9685
	config PWMConfig
	mu     *sync.Mutex
}

var DefaultPWMConfig = PWMConfig{
	Address: 0x40,
}

func NewPWM(bus i2c.Bus, config PWMConfig) (PWM, error) {
	pwm := pca9685Driver{
		values: make(map[int]int),
		driver: drivers.NewPCA9685(byte(config.Address), bus),
		config: config,
		mu:     &sync.Mutex{},
	}
	pwm.driver.Freq = 1500
	return &pwm, pwm.Start()
}

func (p *pca9685Driver) Start() error {
	return p.driver.Wake()
}

// value should be within 0-99
func (p *pca9685Driver) Set(pin int, value int) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	off := int(float32(value) * 40.96)
	p.values[pin] = off
	return p.driver.SetPwm(pin, 0, off)
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
	return p.driver.SetPwm(pin, 0, v)
}

func (p *pca9685Driver) Off(pin int) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.values[pin] = 0
	return p.driver.SetPwm(pin, 0, 0)
}

func (p *pca9685Driver) Stop() error {
	return p.driver.Close()
}
