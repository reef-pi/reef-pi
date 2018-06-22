package ato

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"testing"
	"time"
)

func TestUsage(t *testing.T) {
	t1 := time.Now()
	u1 := Usage{
		Pump: 2,
		Time: utils.TeleTime(t1),
	}

	u2 := Usage{
		Pump: 3,
		Time: utils.TeleTime(t1.Add(2 * time.Hour)),
	}

	if !u1.Before(u2) {
		t.Error(u1, "should be before", u2)
	}
	if u3, next := u1.Rollup(u2); !next {
		t.Error("expected to rollup. Metric:", u3)
	}
	u2.Time = u1.Time
	if u3, next := u1.Rollup(u2); next {
		t.Error("expected to not rollup. Metric:", u3)
	}
}
