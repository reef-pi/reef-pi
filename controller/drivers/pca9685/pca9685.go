package pca9685

import (
	"fmt"
	"log"
	"sort"
	"strconv"
	"sync"

	"github.com/reef-pi/drivers"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/types/driver"
	"github.com/reef-pi/rpi/i2c"
)

type PCA9685Config struct {
	Address   int  `json:"address"` // 0x40
	DevMode   bool `json:"dev_mode"`
	Frequency int  `json:"frequency"`
}

type pca9685Channel struct {
	driver  *pca9685Driver
	channel int
}

func (c *pca9685Channel) Name() string            { return fmt.Sprintf("%d", c.channel) }
func (c *pca9685Channel) Set(value float64) error { return c.driver.set(c.channel, value) }

type pca9685Driver struct {
	config   PCA9685Config
	hwDriver *drivers.PCA9685
	mu       *sync.Mutex
	channels []*pca9685Channel
}

var DefaultPCA9685Config = PCA9685Config{
	Address:   0x40,
	Frequency: 1500,
}

func NewPCA9685(s settings.Settings, bus i2c.Bus) (driver.Driver, error) {
	config := DefaultPCA9685Config
	config.Frequency = s.PCA9685_PWMFreq

	hwDriver := drivers.NewPCA9685(byte(config.Address), bus)
	pwm := pca9685Driver{
		config: config,
		mu:     &sync.Mutex{},
	}
	if config.Frequency == 0 {
		log.Println("WARNING: pca9685 driver pwm frequency set to 0. Falling back to 1500")
		config.Frequency = 1500
	}
	hwDriver.Freq = config.Frequency // overriding default
	for i := 0; i < 16; i++ {
		ch := &pca9685Channel{
			channel: i,
			driver:  &pwm,
		}
		pwm.channels = append(pwm.channels, ch)
	}
	return &pwm, hwDriver.Wake()
}

func (p *pca9685Driver) Close() error {
	return p.hwDriver.Close()
}

func (p *pca9685Driver) Metadata() driver.Metadata {
	return driver.Metadata{
		Name:        "pca9685",
		Description: "Supports one PCA9685 chip",
		Capabilities: driver.Capabilities{
			PWM: true,
		},
	}
}

func (p *pca9685Driver) PWMChannels() []driver.PWMChannel {
	var chs []driver.PWMChannel
	for _, ch := range p.channels {
		chs = append(chs, ch)
	}
	sort.Slice(chs, func(i, j int) bool { return chs[i].Name() < chs[j].Name() })
	return chs
}

func (p *pca9685Driver) GetPWMChannel(name string) (driver.PWMChannel, error) {
	chnum, err := strconv.ParseInt(name, 10, 64)
	if err != nil {
		return nil, err
	}
	if chnum < 0 || int(chnum) > len(p.channels) {
		return nil, fmt.Errorf("invalid channel numer %s", name)
	}
	return p.channels[chnum], nil
}

// value should be within 0-100
func (p *pca9685Driver) set(pin int, value float64) error {
	if (value > 100) || (value < 0) {
		return fmt.Errorf("invalid pwm range: %f, value should be within 0 to 100", value)
	}
	p.mu.Lock()
	defer p.mu.Unlock()
	off := int(value * 40.96)
	return p.hwDriver.SetPwm(pin, 0, off)
}
