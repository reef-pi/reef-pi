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

func currentDisplayState() (bool, error) {
	var state bool
	d, err := ioutil.ReadFile(PowerFile)
	if err != nil {
		return state, err
	}
	state = string(d) == "0"
	return state, nil
}

func EnableDisplay() error {
	return ioutil.WriteFile(PowerFile, []byte("0"), 0644)
}

func DisableDisplay() error {
	return ioutil.WriteFile(PowerFile, []byte("1"), 0644)
}

func SetBrightness(b int) error {
	return ioutil.WriteFile(BrightnessFile, []byte(strconv.Itoa(b)), 0644)
}
