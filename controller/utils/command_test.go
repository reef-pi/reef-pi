package utils

import (
	"testing"
)

func TestCommand(t *testing.T) {
	if err := Command("ls").Run(); err != nil {
		t.Error(err)
	}
	if _, err := Command("doesnotexist").WithDevMode(true).CombinedOutput(); err != nil {
		t.Error(err)
	}
	if _, err := Command("ls").CombinedOutput(); err != nil {
		t.Error(err)
	}
	c := Command("ls")
	c.DevMode = true
	if err := c.Run(); err != nil {
		t.Error(err)
	}
}
