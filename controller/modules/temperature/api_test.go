package temperature

import (
	"testing"

	"github.com/reef-pi/hal"
	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

func TestTemperatureAPI(t *testing.T) {
	t.Parallel()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	outlets := con.DM().Outlets()
	if err := outlets.Setup(); err != nil {
		t.Fatal(err)
	}
	eqs := equipment.New(con)
	if err := eqs.Setup(); err != nil {
		t.Error(err)
	}
	o1 := connectors.Outlet{Name: "O1", Pin: 21, Driver: "rpi"}
	if err := outlets.Create(o1); err != nil {
		t.Error(err)
	}
	o1.Pin = 19
	o1.Name = "O2"
	if err := outlets.Create(o1); err != nil {
		t.Error(err)
	}
	eq := equipment.Equipment{Outlet: "1", Name: "Heater"}
	if err := eqs.Create(eq); err != nil {
		t.Error(err)
	}
	eq.Name = "cooler"
	eq.Outlet = "2"
	if err := eqs.Create(eq); err != nil {
		t.Error(err)
	}
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	tc := &TC{
		Control: true,
		Enable:  true,
		Heater:  "1",
		Cooler:  "2",
		Min:     77,
		Max:     81,
		Name:    "foo",
		Period:  60,
		Notify: Notify{
			Enable: true, Min: 78, Max: 81,
		},
	}
	c.Start()
	if err := c.Create(tc); err != nil {
		t.Fatal("Failed to create temperature controller config:", err)
	}
	if err := c.Update("1", tc); err != nil {
		t.Fatal("Failed to update temperature controller config:", err)
	}
	got, err := c.Get("1")
	if err != nil {
		t.Fatal("Failed to get temperature controller config:", err)
	}

	if err := c.On("1", true); err != nil {
		t.Error(err)
	}
	c.Stop()
	c.Start()
	got.loadHomeostasis(con)
	c.Check(got)
	u := controller.Observation{Value: 67}
	c.Check(got)
	u.Value = 83
	c.Check(got)
	u.Value = 70
	c.Check(got)
	u.Value = 79
	c.Check(got)

	if _, err := c.Usage("1"); err != nil {
		t.Fatal("Failed to get temperature controller usage:", err)
	}

	if _, err := c.List(); err != nil {
		t.Fatal("Failed to list temperature controllers:", err)
	}

	inUse, err := c.IsEquipmentInUse("1")
	if err != nil {
		t.Error(err)
	}
	if !inUse {
		t.Error("Equipment should be in use")
	}
	inUse, err = c.IsEquipmentInUse("12")
	if err != nil {
		t.Error(err)
	}
	if inUse {
		t.Error("Equipment should not be in use")
	}

	if _, err := c.CurrentReading("1"); err != nil {
		t.Fatal("Failed to get current reading:", err)
	}
	if _, err := c.Read(got); err != nil {
		t.Fatal("Failed to read tc:", err)
	}

	if err := c.Delete("1"); err != nil {
		t.Fatal("Failed to delete temperature controller config:", err)
	}
	c.Stop()
}

func TestTemperatureCalibrateAPI(t *testing.T) {
	c := setupTempController(t)
	defer c.c.Store().Close()

	tc := &TC{
		Name:   "Water",
		Period: 1,
		Sensor: "28-api-calibration",
	}
	if err := c.Create(tc); err != nil {
		t.Fatal(err)
	}

	measurements := []hal.Measurement{
		{Expected: 77, Observed: 76},
		{Expected: 82, Observed: 80},
	}
	if err := c.Calibrate("1", measurements); err != nil {
		t.Fatal("failed to calibrate temperature controller:", err)
	}
	if _, ok := c.calibrators[tc.Sensor]; !ok {
		t.Fatal("expected calibrator to be registered")
	}
}
