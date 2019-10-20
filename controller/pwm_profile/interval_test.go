package pwm_profile

import (
	"testing"
	"time"
)

func TestInterval(t *testing.T) {
	conf := `
{
	"start":"10:00:00",
	"end": "19:30:00",
	"interval": 60,
	"values": [0,10,30,40,50,60,80,40,20,10]
}
`
	i, err := Interval([]byte(conf), 13, 100)
	if err != nil {
		t.Fatal(err)
	}
	t1, err := time.Parse(tFormat, "10:30:00")
	if err != nil {
		t.Error(err)
	}
	if int(i.Get(t1)) != 0 {
		t.Error("Expected 0, got:", i.Get(t1))
	}
	t2, err := time.Parse(tFormat, "16:30:00")
	if err != nil {
		t.Error(err)
	}
	if int(i.Get(t2)) != 60 {
		t.Error("Expected 60, got:", i.Get(t2))
	}
}
