package modules

import (
	"io/ioutil"
	"os"
	"testing"
	"time"
)

type NullRunner struct {
}

func (r *NullRunner) Run(_ string, _ ...string) error {
	return nil
}

func TestPhotoshoot(t *testing.T) {
	tempdir, err := ioutil.TempDir(os.TempDir(), "reefer-test")
	if err != nil {
		t.Error(err)
	}
	defer os.Remove(tempdir)
	controller := &NullController{}
	camera := NewCamera(controller, tempdir, time.Duration(1))
	camera.runner = &NullRunner{}
	if err := camera.Photoshoot(); err != nil {
		t.Error(err)
	}
}
