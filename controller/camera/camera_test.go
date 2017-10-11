package camera

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
)

func TestCamera(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	c, err := New(store)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	c.Start()
	c.Stop()
}
