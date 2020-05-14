package system

import (
	"io/ioutil"
	"strconv"
	"strings"
)

const (
	PowerFile      = "/sys/class/backlight/rpi_backlight/bl_power"
	BrightnessFile = "/sys/class/backlight/rpi_backlight/brightness"
)

//swagger:model displayState
type DisplayState struct {
	On         bool `json:"on"`
	Brightness int  `json:"brightness"`
}

//swagger:model displayConfig
type DisplayConfig struct {
	Enable     bool `json:"enable"`
	Brightness int  `json:"brightness"`
}

func (c *Controller) currentDisplayState() (DisplayState, error) {
	var state DisplayState
	if c.config.DevMode {
		return state, nil
	}
	d, err := ioutil.ReadFile(c.PowerFile)
	if err != nil {
		return state, err
	}
	state.On = string(d) == "0"
	b, err := c.getBrightness()
	if err != nil {
		return state, err
	}
	state.Brightness = b
	return state, nil
}

func (c *Controller) enableDisplay() error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(c.PowerFile, []byte("0"), 0644)
}

func (c *Controller) disableDisplay() error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(c.PowerFile, []byte("1"), 0644)
}

func (c *Controller) getBrightness() (int, error) {
	if c.config.DevMode {
		return 50, nil
	}
	data, err := ioutil.ReadFile(c.BrightnessFile)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(strings.TrimSpace(string(data)))
}
func (c *Controller) setBrightness(b int) error {
	if c.config.DevMode {
		return nil
	}
	return ioutil.WriteFile(c.BrightnessFile, []byte(strconv.Itoa(b)), 0644)
}
