package pwm_profile

import (
	"testing"
	"time"
)

func TestAuto(t *testing.T) {
	conf := []byte(`{"values":[0,0,0]}`)
	if _, err := Auto(conf, 0, 100); err == nil {
		t.Error("should not be created when values are not exactly 12")
	}
	conf = []byte(`{"values":[0,0,0,0,0,5,40,79,62,13,8,0]}`)

	a, err := Auto(conf, 0, 100)
	if err != nil {
		t.Error("should be created when values are not exactly 12")
	}
	date, err := time.Parse(time.Kitchen, "5:04PM")
	if err != nil {
		t.Error(err)
	}

	v := a.Get(date)
	if v != 35.86666666666667 {
		t.Error(v)
	}

}
