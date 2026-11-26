package temperature

import (
	"math"
	"time"

	"github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const (
	devAmbientF = 68.0
	devInitialF = 78.5
	devHeaterF  = 17.0 // Shift in equilibrium with the heater on.
	devFanF     = 9.0  // Shift in equilibrium with the fan on.
	devTankTime = 15 * time.Minute
)

type devTank struct {
	fahrenheit float64
	lastRead   time.Time
}

func (c *Controller) readDevTemperature(tc *TC, now time.Time) float64 {
	tc.Lock()
	defer tc.Unlock()

	tank := &tc.devTank
	if tank.lastRead.IsZero() {
		tank.fahrenheit = devInitialF
		tank.lastRead = now
	} else if elapsed := now.Sub(tank.lastRead); elapsed > 0 {
		equilibrium := devAmbientF
		if !tc.IsMacro && (tc.Heater != "" || tc.Cooler != "") {
			sub, _ := c.c.Subsystem(equipment.Bucket)
			if outlets, ok := sub.(*equipment.Controller); ok {
				if devEquipmentOn(outlets, tc.Heater) {
					equilibrium += devHeaterF
				}
				if devEquipmentOn(outlets, tc.Cooler) {
					equilibrium -= devFanF
				}
			}
		}
		// Exponential drift keeps the tank bounded even after a long pause.
		tank.fahrenheit += (equilibrium - tank.fahrenheit) * -math.Expm1(-float64(elapsed)/float64(devTankTime))
		tank.lastRead = now
	}

	if tc.Fahrenheit {
		return utils.RoundToTwoDecimal(tank.fahrenheit)
	}
	return utils.RoundToTwoDecimal((tank.fahrenheit - 32) * 5 / 9)
}

func devEquipmentOn(outlets *equipment.Controller, id string) bool {
	if id == "" {
		return false
	}
	eq, err := outlets.Get(id)
	return err == nil && eq.On
}
