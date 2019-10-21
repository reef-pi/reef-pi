package pwm_profile

import (
	"testing"
	"time"
)

func TestLunar(t *testing.T) {
	conf := `
{
	"start":"10:00:00",
	"end": "19:30:00",
	"full_moon": "Feb 3 2013"
}
`
	l, err := Lunar([]byte(conf), 13, 100)
	if err != nil {
		t.Fatal(err)
	}
	format := "Jan 2 2006 15:04"
	t1, err := time.Parse(format, "Feb 10 2013 9:30")
	if err != nil {
		t.Error(err)
	}
	v1 := int(l.Get(t1))
	if v1 != 0 {
		t.Error("Expected 0, found:", v1)
	}
}
