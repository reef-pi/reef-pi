package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestSubsystem(t *testing.T) {
	c, err := utils.TestController()
	if err != nil {
		t.Error(err)
	}
	_, err = New(true, c)
	if err != nil {
		t.Error(err)
	}
}
