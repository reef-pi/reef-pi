package temperature

import (
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestUsage(t *testing.T) {
	u1 := Usage{
		Heater:      2,
		Cooler:      4,
		Time:        utils.TeleTime(time.Now()),
		Temperature: 78,
	}
	u2 := u1
	if _, next := u1.Rollup(u2); next {
		t.Error("Same hour usage should not be rolled up")
	}
	u2.Time = utils.TeleTime(time.Now().Add(2 * time.Hour))
	if _, next := u1.Rollup(u2); !next {
		t.Error("Different hour usage shouldbe rolled up")
	}
	if b := u1.Before(u2); !b {
		t.Error("should be before")
	}
}
