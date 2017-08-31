package utils

import (
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/controller/mcp4725"
)

type DACConfig struct {
	Address int  `json:"address"`
	Bus     int  `json:"bus"`
	DevMode bool `json:"dev_mode"`
}

type DAC struct {
	conn   *mcp4725.MCP4725
	config DACConfig
	value  int
}

var DefaultDACConfig = PWMConfig{
	Bus:     1,
	Address: 0x40,
}

func NewDAC(config DACConfig) (*DAC, error) {
	var bus embd.I2CBus
	if config.DevMode {
		bus = &DevI2CBus{}
	} else {
		bus = embd.NewI2CBus(byte(config.Bus))
	}
	dac := DAC{
		conn:   mcp4725.New(bus, byte(config.Address)),
		config: config,
	}
	return &dac, nil
}

func (d *DAC) Set(value int) error {
	off := int(float32(value) * 40.96)
	d.value = off
	return d.conn.SetVoltage(d.value)
}

func (d *DAC) Get() int {
	return d.value
}

func (d *DAC) On(pin int) error {
	v := 4095
	if d.value != 0 {
		v = d.value
	}
	return d.conn.SetVoltage(v)
}

func (d *DAC) Off(pin int) error {
	d.value = 0
	return d.conn.SetVoltage(0)
}

func (d *DAC) Stop() error {
	if err := d.conn.Close(); err != nil {
		return err
	}
	if d.config.DevMode {
		return nil
	}
	return embd.CloseI2C()
}
