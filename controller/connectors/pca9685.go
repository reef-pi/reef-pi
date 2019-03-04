package connectors

import (
	"fmt"
	"github.com/reef-pi/drivers"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/rpi/i2c"
	"log"
	"sync"
)

type PCA9685Config struct {
	Address   int  `json:"address"` // 0x40
	DevMode   bool `json:"dev_mode"`
	Frequency int  `json:"frequency"`
}

type pca9685Driver struct {
	values map[int]int
	driver *drivers.PCA9685
	config PCA9685Config
	mu     *sync.Mutex
}

var DefaultPCA9685Config = PCA9685Config{
	Address:   0x40,
	Frequency: 1500,
}

func NewPCA9685(bus i2c.Bus, config PCA9685Config) (types.PWM, error) {
	pwm := pca9685Driver{
		values: make(map[int]int),
		driver: drivers.NewPCA9685(byte(config.Address), bus),
		config: config,
		mu:     &sync.Mutex{},
	}
	if config.Frequency == 0 {
		log.Println("WARNING: pca9685 driver pwm frequency set to 0. Falling back to 1500")
		config.Frequency = 1500
	}
	log.Println("Setting pca9685 frquency:", config.Frequency)
	pwm.driver.Freq = config.Frequency // overriding default
	return &pwm, pwm.Start()
}

func (p *pca9685Driver) Start() error {
	return p.driver.Wake()
}

// value should be within 0-99
func (p *pca9685Driver) Set(pin int, value float64) error {
	if (value > 100) || (value < 0) {
		return fmt.Errorf("Invalid pwm range: %f, value should be within 0 to 100", value)
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	off := int(value * 40.96)
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
