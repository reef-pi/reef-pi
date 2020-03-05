package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestSubsystem(t *testing.T) {
	t.Parallel()
	c, err := controller.TestController()
	defer c.Store().Close()

	if err != nil {
		t.Error(err)
	}
	_, err = New(true, c)
	if err != nil {
		t.Error(err)
	}
}
