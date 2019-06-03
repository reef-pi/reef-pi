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
	"end": "19:30",
	"min":13,
	"max":100
}
`
	d, err := Diurnal([]byte(conf))
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
}
