package equipments

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
)

type Outlet struct {
	Name      string `json:"name" yaml:"name"`
	Pin       int    `json:"pin" yaml:"pin"`
	Type      string `json:"type" yaml:"type"`
	Equipment string `json:"equipment" yaml:"-"`
}

func (c *Controller) ConfigureOutlet(id string, on bool) error {
	o, ok := c.config.Outlets[id]
	if !ok {
		return fmt.Errorf("Outlet named: '%s' does noy exist", id)
	}
	if c.config.DevMode {
		log.Println("Dev mode on. Skipping:", id, "On:", on)
		return nil
	}
	if on {
		return utils.SwitchOn(o.Pin)
	}
	return utils.SwitchOff(o.Pin)
}
