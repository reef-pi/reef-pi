package pwm_profile

import (
	"testing"
	"time"
)

func TestDiurnal(t *testing.T) {
	tFormat := "15:04"
	conf := `
{
	"start":"10:00",
	"end": "19:30"
}
`
	d, err := Diurnal([]byte(conf), 13, 100)
	if err != nil {
		t.Error(err)
	}
	t1, err := time.Parse(tFormat, "01:30")
	if err != nil {
		t.Error(err)
	}
	if d.Get(t1) != 0 {
		t.Error("Exp")
	}
	t2, err := time.Parse(tFormat, "11:20")
	if err != nil {
		t.Error(err)
	}
	if d.Get(t2) != 77.64757951804073 {
		t.Error(d.Get(t2))

	}
}
