package system

import (
	"io/ioutil"
	"strconv"
)

const (
	PowerFile      = "/sys/class/backlight/rpi_backlight/bl_power"
	BrightnessFile = "/sys/class/backlight/rpi_backlight/brightness"
)

type DisplayState struct {
	On bool `json:"on"`
}

type DisplayConfig struct {
	Enable     bool `json:"enable"`
	Brightness int  `json:"brightness"`
}

func (c *Controller) currentDisplayState() (bool, error) {
	if c.config.DevMode {
		return true, nil
	}
	var state bool
	d, err := ioutil.ReadFile(PowerFile)
	if err != nil {
		return state, err
	}
	state = string(d) == "0"
	return state, nil
}

func (c *Controller) enableDisplay() error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(PowerFile, []byte("0"), 0644)
}

func (c *Controller) disableDisplay() error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(PowerFile, []byte("1"), 0644)
}

func (c *Controller) setBrightness(b int) error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(BrightnessFile, []byte(strconv.Itoa(b)), 0644)
}
