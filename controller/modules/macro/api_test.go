package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestSubsystem(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Error(err)
	}
	_, err = New(true, c)
	if err != nil {
		t.Error(err)
	}
}
