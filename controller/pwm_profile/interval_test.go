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
	"interval": 3600,
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

// https://github.com/reef-pi/reef-pi/issues/960
// start: 00:00:00
// end: 23:59:59
// interval:7849
// values:[99,0,0,0,0,0,0,0,0,50,85,99]
// values:[0,0,0,0,50,85,100,85,50,0,0,0]
func TestPanicAtMidnight(t *testing.T) {
	conf := `
	{
	"start":"00:00:00",
	"end":"23:59:59",
	"values":[99,0,0,0,0,0,0,0,0,50,85,99],
	"interval":7849
	}
	`
	i, err := Interval([]byte(conf), 0, 100)
	if err != nil {
		t.Fatal(err)
	}
	t1, err := time.Parse(tFormat, "23:59:00")
	if err != nil {
		t.Error(err)
	}
	if int(i.Get(t1)) < 98 {
		t.Error("Expected 99, got:", i.Get(t1))
	}
}
