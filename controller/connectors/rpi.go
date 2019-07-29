package connectors

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/rpi/pwm"
)

type rpiDriver struct {
	driver  pwm.Driver
	Freq    int
	DevMode bool
}

func NewRPIPWMDriver(freq int, devMode bool) types.PWM {
	return &rpiDriver{
		driver:  pwm.New(),
		Freq:    freq,
		DevMode: devMode,
	}
}
func (d *rpiDriver) Start() error {
	return nil
}

func (d *rpiDriver) Stop() error {
	return nil
}

func (d *rpiDriver) Set(pin int, v float64) error {
	if (v > 100) || (v < 0) {
		return fmt.Errorf("Invalid pwm range: %f, value should be within 0 to 100", v)
	}
	if d.DevMode {
		return nil
	}

	return d.driver.DutyCycle(pin, int(v))
}
func (d *rpiDriver) Get(pin int) (int, error) {
	return 0, nil
}

func (d *rpiDriver) On(pin int) error {
	if d.DevMode {
		return nil
	}
	exported, err := d.driver.IsExported(pin)
	if err != nil {
		return err
	}
	if !exported {
		if err := d.driver.Export(pin); err != nil {
			return err
		}
	}
	if err := d.driver.Frequency(pin, d.Freq); err != nil {
		return err
	}
	if err := d.driver.DutyCycle(pin, 0); err != nil {
		return err
	}
	return d.driver.Enable(pin)
}

func (d *rpiDriver) Off(pin int) error {
	if d.DevMode {
		return nil
	}
	exported, err := d.driver.IsExported(pin)
	if err != nil {
		return err
	}
	if !exported {
		return nil
	}
	if err := d.driver.Disable(pin); err != nil {
		return err
	}
	return d.driver.Unexport(pin)
}
