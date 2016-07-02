package modules

import (
	log "github.com/Sirupsen/logrus"
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/convertors/mcp3008"
	_ "github.com/kidoman/embd/host/all"
	"time"
)

type ADC struct {
	device   *mcp3008.MCP3008
	ChanNum  int
	Interval time.Duration
	quitCh   chan struct{}
}

func (a *ADC) On() error {
	channel := byte(0)
	speed := 1000000
	bpw := 8
	delay := 0
	if err := embd.InitSPI(); err != nil {
		log.Errorln("Failed to initialize SPI bus. Error:", err)
		return err
	}
	spiBus := embd.NewSPIBus(embd.SPIMode0, channel, speed, bpw, delay)
	a.device = mcp3008.New(mcp3008.SingleMode, spiBus)
	ticker := time.NewTicker(a.Interval * time.Second)
	log.Infof("Reading analog input at pin %d after every %d seconds", a.ChanNum, a.Interval)
	a.quitCh = make(chan struct{})
	for {
		select {
		case <-ticker.C:
			v, err := a.Read(a.ChanNum)
			if err != nil {
				log.Errorf("Failed to read water level sensor value (%d). Error: %s", v, err)
				continue
			}
			log.Infof("Analog value at channel '%d' is '%d'", a.ChanNum, v)
		case <-a.quitCh:
			ticker.Stop()
			return nil
		}
	}
	return nil
}

func (a *ADC) Off() error {
	log.Infof("Turning off adc on port %d", a.ChanNum)
	a.quitCh <- struct{}{}
	embd.CloseSPI()
	a.device.Bus.Close()
	return nil
}

func (a *ADC) Read(chanNum int) (int, error) {
	val, err := a.device.AnalogValueAt(chanNum)
	if err != nil {
		return val, err
	}
	return val, nil
}
