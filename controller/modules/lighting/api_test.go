package lighting

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
)

func TestLightingAPI(t *testing.T) {
	t.Parallel()

	config := DefaultConfig
	config.Interval = 1 * time.Second
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller. Error:", err)
	}
	d1 := drivers.Driver{
		Name:   "lighting",
		Type:   "pca9685",
		Config: []byte(`{"address":64, "frequency":1000}`),
	}
	if err := con.DM().Drivers().Create(d1); err != nil {
		t.Fatal(err)
	}
	jacks := con.DM().Jacks()
	if err := jacks.Setup(); err != nil {
		t.Fatal(err)
	}
	c, err := New(config, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal("Failed to setup lighting controller")
	}
	c.Start()
	time.Sleep(2 * time.Second)
	c.Stop()
	j1 := connectors.Jack{
		Name:   "J1",
		Pins:   []int{3},
		Driver: "1",
	}
	if err := c.jacks.Create(j1); err != nil {
		t.Fatal(err)
	}
	jacksList, err := c.jacks.List()
	if err != nil {
		t.Fatal(err)
	}
	channels := make(map[int]*Channel)
	channels[1] = &Channel{
		Name:   "ch1",
		Min:    12,
		Manual: true,
	}
	l := Light{
		Jack:     jacksList[0].ID,
		Name:     "Foo",
		Channels: channels,
	}
	if err := c.Create(l); err != nil {
		t.Fatal("Failed to create light:", err)
	}
	lights, err := c.List()
	if err != nil {
		t.Fatal("Failed to list lights:", err)
	}
	if len(lights) == 0 {
		t.Fatal("Expected at least one light")
	}
	id := lights[0].ID

	if _, err := c.Get(id); err != nil {
		t.Fatal("Failed to get light:", err)
	}
	if err := c.Update(id, l); err != nil {
		t.Fatal("Failed to update light:", err)
	}

	c.Setup() //nolint:errcheck
	ch, _ := channels[1]
	l.Channels[1] = ch
	c.UpdateChannel(id, *ch, 10)
	if err := c.On(id, true); err != nil {
		t.Error(err)
	}
	if err := c.Delete(id); err != nil {
		t.Fatal("Delete light failed:", err)
	}

	l.Name = ""
	if err := c.Create(l); err == nil {
		t.Error("Light with empty name should be failed to create")
	}
	l.Name = "xxx"
	l.Jack = ""
	if err := c.Create(l); err == nil {
		t.Error("Light with empty jack should be failed to create")
	}
	l.Jack = "1"
	l.Channels = nil
	if err := c.Create(l); err != nil {
		t.Error("Light with empty channels should be allowed to create")
	}
	ch.Min = 2
	ch.Max = 8
	channels[1] = ch
	l.Channels = channels
	c.syncLight(l)
}
