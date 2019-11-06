package pwm_profile

import (
	"testing"
	"time"
)

func TestTemporal(t *testing.T) {
	conf := `
{
	"start":"10:00:00",
	"end": "19:30:00"
}
`
	p, err := Temporal([]byte(conf), 13, 100)
	if err != nil {
		t.Error(err)
	}

	if p.ValueRange() != 87 {
		t.Error("Expected 87, found:", p.ValueRange())
	}

	if p.TotalMinutes() != 570 {
		t.Error("Expected 570, found:", p.TotalMinutes())
	}

	if n := p.PastMinutes(time.Now()); n == 0 {
		t.Error("Expected non-zero, found:", n)
	}
}
