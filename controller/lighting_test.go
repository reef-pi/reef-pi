package controller

import (
	"os"
	"testing"
	"time"
)

func TestLightingAPI(t *testing.T) {
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
		Channel:     1,
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

func TestGetCurrentValue(t *testing.T) {
	l := Lighting{
		Intensities: []int{0, 0, 0, 0, 20, 40, 60, 70, 30, 10, 0, 0},
	}
	if err := l.Validate(); err != nil {
		t.Error(err)
		return
	}
	t1 := time.Date(2015, time.October, 12, 0, 0, 0, 0, time.UTC)
	v := l.getCurrentValue(t1)
	if v != 0 {
		t.Error("Expected 0, found:", v)
		return
	}
}
