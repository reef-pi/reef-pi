package camera

import (
	"testing"
)

func TestCamera(t *testing.T) {
	config := Config{
		ImageDirectory: "../../../images",
	}
	c := New(config)
	c.Start()
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	c.Stop()
}
