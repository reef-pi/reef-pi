package utils

import (
	"fmt"
	"github.com/reef-pi/rpi/pwm"
)

type rpiDriver struct {
	driver pwm.Driver
}

func NewRPIPWMDriver() PWM {
	return &rpiDriver{
		driver: pwm.New(),
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
	// Assume 100Hz frequency
	return d.driver.DutyCycle(pin, percentage*100000)

}
func (d *rpiDriver) Get(pin int) (int, error) {
	return 0, nil
}

func (d *rpiDriver) On(pin int) error {
	if err := d.driver.Export(pin); err != nil {
		return err
	}
	// Enforce 100Hz frequency
	if err := d.driver.Frequency(pin, 10000000); err != nil {
		return err
	}
	if err := d.driver.DutyCycle(pin, 0); err != nil {
		return err
	}
	return d.driver.Enable(pin)
}
func (d *rpiDriver) Off(pin int) error {
	if err := d.driver.Disable(pin); err != nil {
		return err
	}
	return d.driver.Unexport(pin)
}
