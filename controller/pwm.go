package controller

import (
	"github.com/kidoman/embd"
	"github.com/kidoman/embd/controller/pca9685"
	_ "github.com/kidoman/embd/host/rpi"
)

type PWMApi struct {
	PWMValues map[int]int
	conn      *pca9685.PCA9685
}

type PWMConfig struct {
	Address   int
	BusNumber byte
}

func NewPWMApi() *PWMApi {
	BusNumber := byte(1)
	Address := 0x40
	bus := embd.NewI2CBus(BusNumber)
	conn := pca9685.New(bus, byte(Address))
	return &PWMApi{
		PWMValues: make(map[int]int),
		conn:      conn,
	}
}

func (p *PWMApi) Start() error {
	if err := p.conn.Wake(); err != nil {
		return err
	}
	for pin, value := range p.PWMValues {
		on, off := toSteps(value)
		if err := p.conn.SetPwm(pin, on, off); err != nil {
			return err
		}
	}
	return nil
}

func toSteps(value int) (int, int) {
	return 0, 3800
}

func (p *PWMApi) Stop() error {
	if err := p.conn.Close(); err != nil {
		return err
	}
	return embd.CloseI2C()
}
