package pwm_profile

import (
	"testing"
	"time"
)

func TestSine(t *testing.T) {
	conf := `
{
	"start":"10:00:00",
	"end": "19:30:00"
}
`
	d, err := Sine([]byte(conf), 13, 100)
	if err != nil {
		t.Error(err)
	}
	t1, err := time.Parse(tFormat, "01:30:00")
	if err != nil {
		t.Error(err)
	}
	if d.Get(t1) != 0 {
		t.Error("Expected 0")
	}
	t2, err := time.Parse(tFormat, "11:20:00")
	if err != nil {
		t.Error(err)
	}
	if d.Get(t2) != 50.129549888187114 {
		t.Error(d.Get(t2))
	}
}
