package pwm_profile

import (
	"testing"
	"time"
)

func TestFixedProfile(t *testing.T) {
	if _, err := Fixed([]byte(`{}`), 10, 100); err == nil {
		t.Error("bogus config should fail")
	}
	f, err := Fixed([]byte(`{"value":10, "start":"10:04:05","end":"15:10:05"}`), 10, 100)
	if err != nil {
		t.Error(err)
		return
	}
	now := time.Now()
	outside := time.Date(2020, now.Month(), now.Day(), 1, 0, 0, 0, time.UTC)
	if !f.IsOutside(outside) {
		t.Error("should be outside")
	}
	inside := time.Date(2020, now.Month(), now.Day(), 11, 0, 0, 0, time.UTC)
	if f.IsOutside(inside) {
		t.Error("should be outside")
	}

	if f.Get(inside) != 10 {
		t.Error(f.Get(inside))
	}
}
