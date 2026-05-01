package telemetry

import (
	"context"
	"errors"
	"os/exec"
	"strings"
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
	issues, err := GetThrottled(context.Background(), stubFactory)
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

func TestThrottleTypeStringUnknown(t *testing.T) {
	known := UnderVoltage
	if known.String() != "under voltage" {
		t.Fatalf("unexpected known throttle string: %q", known.String())
	}
	unknown := ThrottleType(99)
	if unknown.String() != _unknown {
		t.Fatalf("expected unknown throttle string, got %q", unknown.String())
	}
}

func TestGetThrottledErrors(t *testing.T) {
	tests := []struct {
		name    string
		output  []byte
		runErr  error
		wantErr string
	}{
		{
			name:    "runner error",
			runErr:  errors.New("vcgencmd failed"),
			wantErr: "vcgencmd failed",
		},
		{
			name:    "bad format",
			output:  []byte("throttled"),
			wantErr: "failed to parse output",
		},
		{
			name:    "bad integer",
			output:  []byte("throttled=nope"),
			wantErr: "invalid syntax",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			factory := func(context.Context, string, ...string) Runner {
				return func() ([]byte, error) {
					return tt.output, tt.runErr
				}
			}
			_, err := GetThrottled(context.Background(), factory)
			if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
				t.Fatalf("expected error containing %q, got %v", tt.wantErr, err)
			}
		})
	}
}

func TestGetThrottledMultipleBits(t *testing.T) {
	factory := func(context.Context, string, ...string) Runner {
		return func() ([]byte, error) {
			return []byte("throttled=0x50005"), nil
		}
	}
	issues, err := GetThrottled(context.Background(), factory)
	if err != nil {
		t.Fatal(err)
	}
	found := map[ThrottleType]bool{}
	for _, issue := range issues {
		found[issue] = true
	}
	for _, expected := range []ThrottleType{UnderVoltage, CurrentlyThrottled, UnderVoltageHasOccurred, ThrottlingHasOccurred} {
		if !found[expected] {
			t.Fatalf("expected throttle %s in %#v", expected.String(), issues)
		}
	}
}

func TestExecFactory(t *testing.T) {
	out, err := ExecFactory(context.Background(), "printf", "ok")()
	if err != nil {
		if _, missing := err.(*exec.Error); missing {
			t.Skip("printf executable not available")
		}
		t.Fatal(err)
	}
	if string(out) != "ok" {
		t.Fatalf("expected command output, got %q", string(out))
	}
}
