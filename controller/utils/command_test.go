package utils

import (
	"testing"
)

func TestCommand(t *testing.T) {

	if _, err := Command("doesnotexist").WithDevMode(true).CombinedOutput(); err != nil {
		t.Error(err)
	}
	if _, err := Command("ls").CombinedOutput(); err != nil {
		t.Error(err)
	}

}
