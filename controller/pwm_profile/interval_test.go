package pwm_profile

import (
	"testing"
	"time"
)

func TestInterval(t *testing.T) {
	badConf := `
{
	"start":"10:00:00",
	"end": "19:30:00",
	"interval": -10,
	"values": [0,,80,40,20,10]
}
`
	if _, err := Interval([]byte(badConf), 13, 100); err == nil {
		t.Error("bogus config should fail")
	}
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
	outside := time.Date(2024, 1, 1, 21, 0, 0, 0, time.UTC)
	if i.Get(outside) != 0 {
		t.Error("Expected 0, got:", i.Get(outside))
	}
}

// https://github.com/reef-pi/reef-pi/issues/1117
// At exactly the end time the profile should return the last configured value,
// not 0. Previously Get() checked IsOutside(t+1s), causing a premature
// zero at the exact boundary second.
func TestIntervalAtEndBoundary(t *testing.T) {
	// 08:00 to 22:00 = 50400 s; 50400/7200 + 1 = 8 values required
	conf := `
{
	"start":"08:00:00",
	"end":"22:00:00",
	"interval":7200,
	"values":[0,10,20,30,40,50,60,40]
}
`
	i, err := Interval([]byte(conf), 0, 100)
	if err != nil {
		t.Fatal(err)
	}
	// Exactly at end time the profile must return the last configured value.
	endTime, err := time.Parse(tFormat, "22:00:00")
	if err != nil {
		t.Fatal(err)
	}
	v := i.Get(endTime)
	if v == 0 {
		t.Errorf("Expected non-zero value at end time, got 0 — interval profile terminated 1 second early")
	}
	// One second AFTER end the profile should return 0.
	after := endTime.Add(time.Second)
	if i.Get(after) != 0 {
		t.Errorf("Expected 0 one second past end time, got %f", i.Get(after))
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
	if i.Name() != "interval" {
		t.Error("expected interval, found:", i.Name())
	}
}
