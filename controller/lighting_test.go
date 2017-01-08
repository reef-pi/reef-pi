package controller

import (
	"os"
	"testing"
)

func TestLighting(t *testing.T) {
	var err error
	var c *Controller
	var list *[]interface{}
	var l *Lighting
	var ok bool

	os.Remove("reefer.db")

	c, err = New(false, false, false)
	if err != nil {
		t.Error(err)
	}
	if err = c.createBuckets(); err != nil {
		t.Error(err)
		return
	}
	list, err = c.ListLightings()
	if err != nil {
		t.Error(err)
		return
	}
	if len(*list) != 0 {
		t.Error("Lighting expected to be empty")
		return
	}

	l = &Lighting{
		Name:        "test-lighting",
		Enabled:     false,
		Intensities: []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		Outlet:      "1",
	}
	if err = c.CreateLighting(*l); err != nil {
		t.Error(err)
		return
	}
	list, err = c.ListLightings()
	if err != nil {
		t.Error(err)
		return
	}
	if len(*list) == 0 {
		t.Error("Lighting list should not be empty")
		return
	}
	l, ok = (*list)[0].(*Lighting)
	if !ok {
		t.Error("Failed to typecast to lighting")
		return
	}
	if l.Name != "test-lighting" {
		t.Error("Expected: 'test-lighting' Found:", l.Name)
		return
	}
}
