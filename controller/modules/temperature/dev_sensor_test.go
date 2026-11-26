package temperature

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

type devTankTestController struct {
	controller.Controller
	equipment *equipment.Controller
}

func (c devTankTestController) Subsystem(name string) (controller.Subsystem, error) {
	if name == equipment.Bucket {
		return c.equipment, nil
	}
	return c.Controller.Subsystem(name)
}

func TestDevTankRespondsToTemperatureController(t *testing.T) {
	c := setupTempController(t)
	defer c.c.Store().Close()
	eqs := equipment.New(c.c)
	if err := c.c.DM().Outlets().Create(connectors.Outlet{Name: "O2", Pin: 22, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}
	if err := eqs.Create(equipment.Equipment{Outlet: "2", Name: "Fan"}); err != nil {
		t.Fatal(err)
	}
	c.c = devTankTestController{Controller: c.c, equipment: eqs}
	tc := &TC{
		Name: "Reef Tank", Sensor: "28-devmodeenable", Fahrenheit: true,
		Min: 78, Max: 81, Period: 60, Heater: "1", Cooler: "2", Control: true,
	}
	if err := c.Create(tc); err != nil {
		t.Fatal(err)
	}
	// Check synchronously while advancing the simulated tank without sleeping.
	tc.Enable = true
	tc.loadHomeostasis(c.c)
	tc.CreateFeed(c.c.Telemetry())
	check := func(after time.Duration) float64 {
		t.Helper()
		tc.devTank.lastRead = tc.devTank.lastRead.Add(-after)
		reading, err := c.Check(tc)
		if err != nil {
			t.Fatal(err)
		}
		return reading
	}
	assertOutlet := func(id string, on bool) {
		t.Helper()
		eq, err := eqs.Get(id)
		if err != nil || eq.On != on {
			t.Fatalf("outlet %s on = %v, %v; want %v", id, eq.On, err, on)
		}
	}
	initial := check(0)
	assertOutlet(tc.Heater, false)
	cooled := check(time.Minute)
	if cooled >= tc.Min || cooled >= initial {
		t.Fatalf("tank should cool below minimum with the heater off, got %v", cooled)
	}
	assertOutlet(tc.Heater, true)
	warmed := check(time.Minute)
	if !tc.WithinRange(warmed) || warmed <= cooled {
		t.Fatalf("heater should warm the tank back into range, got %v", warmed)
	}
	assertOutlet(tc.Heater, false)

	// Lower the maximum to exercise the fan without changing the room temperature.
	tc.Min, tc.Max = 75, 78
	tc.loadHomeostasis(c.c)
	check(0)
	assertOutlet(tc.Cooler, true)
	fanCooled := check(time.Minute)
	if !tc.WithinRange(fanCooled) || fanCooled >= warmed {
		t.Fatalf("fan should cool the tank back into range, got %v", fanCooled)
	}
	assertOutlet(tc.Cooler, false)

	usage, err := c.Usage(tc.ID)
	if err != nil {
		t.Fatal(err)
	}
	var heaterSeconds, fanSeconds int
	for _, sample := range usage.Current {
		observation := sample.(controller.Observation)
		heaterSeconds += observation.Upper
		fanSeconds += observation.Downer
	}
	if heaterSeconds != 60 || fanSeconds != 60 {
		t.Fatalf("recorded heater/fan usage = %d/%d seconds; want 60/60", heaterSeconds, fanSeconds)
	}
}
