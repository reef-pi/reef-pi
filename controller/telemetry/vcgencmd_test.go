package telemetry

import (
	"context"
	"testing"
)

// 0x0 none
//0x50000 arm frequency capped has occurred
//0x50005 arm frequency capped has occurred

func TestGetThrottles(t *testing.T) {
	var bytes []byte
	stubFactory := func(_ context.Context, _ string, _ ...string) Runner {
		return func() ([]byte, error) {
			return bytes, nil
		}
	}
	bytes = []byte("throttled=0x1")
	issues, err := GetThrottled(context.TODO(), stubFactory)
	if err != nil {
		t.Error(err)
	}
	if len(issues) != 1 {
		t.Error("expected throttle issue, found none")
	}
	if issues[0] != UnderVoltage {
		t.Errorf("Expected arm frequency capped, found: '%s'", issues[0].String())
	}
}
