package utils

import (
	"os"
	"testing"
)

func TestGenerateCerts(t *testing.T) {
	os.Remove("server.crt")
	if err := GenerateCerts(); err != nil {
		t.Error(err)
	}
}
