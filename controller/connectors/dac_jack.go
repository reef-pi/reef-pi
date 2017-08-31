package connectors

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type DACJack struct {
	Inverse bool `json:"inverse" yaml:"inverse"`
	dacs    map[int]*utils.DAC
}

func NewDACJack() *DACJack {
	j := DACJack{
		dacs: make(map[int]*utils.DAC),
	}
	return &j
}

func (j *DACJack) Add(pin, address int) error {
	if _, ok := j.dacs[pin]; ok {
		return fmt.Errorf("Pin %d is already assigned", pin)
	}
	conf := utils.DACConfig{
		Bus:     1,
		Address: address,
	}
	dac, err := utils.NewDAC(conf)
	if err != nil {
		return err
	}
	j.dacs[pin] = dac
	return nil
}

func (j *DACJack) Set(pin, v int) error {
	dac, ok := j.dacs[pin]
	if !ok {
		return fmt.Errorf("No assigned DAC found for pin:%d", pin)
	}
	return dac.Set(v)
}
