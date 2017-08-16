package utils

import (
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/convertors/mcp3008"
)

type SPIConfig struct {
	channel byte
	speed   int
	bpw     int
	delay   int
	DevMode bool
}

var (
	DefaultSPIConfig = SPIConfig{
		channel: byte(0),
		speed:   1000000,
		bpw:     8,
		delay:   0,
	}
)

type ADC struct {
	device  *mcp3008.MCP3008
	ChanNum int
	config  SPIConfig
}

func NewADC() *ADC {
	return &ADC{
		config: DefaultSPIConfig,
	}
}

func (a *ADC) Start() error {
	var bus embd.SPIBus
	if a.config.DevMode {
		bus = NewDevSPIBus()
	} else {
		bus = embd.NewSPIBus(
			embd.SPIMode0,
			a.config.channel,
			a.config.speed,
			a.config.bpw,
			a.config.delay,
		)
		if err := embd.InitSPI(); err != nil {
			return err
		}
	}
	a.device = mcp3008.New(mcp3008.SingleMode, bus)
	return nil
}

func (a *ADC) Stop() error {
	if !a.config.DevMode {
		defer embd.CloseSPI()
	}
	return a.device.Bus.Close()
}

func (a *ADC) Read(chanNum int) (int, error) {
	val, err := a.device.AnalogValueAt(chanNum)
	if err != nil {
		return val, err
	}
	return val, nil
}
