package controller

import (
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/convertors/mcp3008"
	_ "github.com/kidoman/embd/host/all"
)

type SPIConfig struct {
	channel byte
	speed   int
	bpw     int
	delay   int
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
	quitCh  chan struct{}
	config  SPIConfig
}

func NewADC(c int) (*ADC, error) {
	return &ADC{
		quitCh: make(chan struct{}),
		config: DefaultSPIConfig,
	}, nil
}

func (a *ADC) On() error {
	if err := embd.InitSPI(); err != nil {
		return err
	}
	spiBus := embd.NewSPIBus(
		embd.SPIMode0,
		a.config.channel,
		a.config.speed,
		a.config.bpw,
		a.config.delay,
	)
	a.device = mcp3008.New(mcp3008.SingleMode, spiBus)
	return nil
}

func (a *ADC) Off() error {
	a.quitCh <- struct{}{}
	embd.CloseSPI()
	return a.device.Bus.Close()
}

func (a *ADC) Read(chanNum int) (int, error) {
	val, err := a.device.AnalogValueAt(chanNum)
	if err != nil {
		return val, err
	}
	return val, nil
}
