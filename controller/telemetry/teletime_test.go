package telemetry

import (
	"testing"
	"time"
)

func TestTeleTime(t *testing.T) {
	t1 := TeleTime(time.Now())
	t2 := TeleTime(time.Now().Add(2 * time.Hour))
	if !t1.Before(t2) {
		t.Error("t1 should be before t2")
	}
	if t1.Hour() > 24 {
		t.Error("Expected less than 24, found:", t1.Hour())
	}
	if _, err := t1.MarshalJSON(); err != nil {
		t.Error(err)
	}
	if err := t1.UnmarshalJSON([]byte("\"Jan-12-23:04, 2020\"")); err != nil {
		t.Error(err)
	}
}
