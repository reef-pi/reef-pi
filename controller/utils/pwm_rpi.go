package utils

import (
	"fmt"
	"github.com/reef-pi/rpi/pwm"
)

type rpiDriver struct {
	driver pwm.Driver
	Freq   int
}

func NewRPIPWMDriver() PWM {
	return &rpiDriver{
		driver: pwm.New(),
		Freq:   150000000, //1.5K Hhz (pca9685 max)
	}
}
func (d *rpiDriver) Start() error {
	return nil
}
func (d *rpiDriver) Stop() error {
	return nil
}

func (d *rpiDriver) Set(pin, percentage int) error {
	if (percentage > 100) || (percentage < 0) {
		return fmt.Errorf("Invalid percentage:%d. Valid range is between 0 to 100", percentage)
	}
	return d.driver.DutyCycle(pin, (d.Freq/100)*percentage)

}
func (d *rpiDriver) Get(pin int) (int, error) {
	return 0, nil
}

func (d *rpiDriver) On(pin int) error {
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
