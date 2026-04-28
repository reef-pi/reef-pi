package lighting

import (
	"strings"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/pwm_profile"
)

func TestChannelValueAtManual(t *testing.T) {
	t.Parallel()

	ch := Channel{
		Name:   "manual",
		Manual: true,
		Value:  42,
	}

	v, err := ch.ValueAt(time.Now())
	if err != nil {
		t.Fatal(err)
	}
	if v != 42 {
		t.Fatalf("expected manual value 42, got %f", v)
	}
}

func TestChannelValueAtLoadsProfileAndAppliesBounds(t *testing.T) {
	t.Parallel()

	ch := Channel{
		Name: "auto",
		Min:  10,
		Max:  100,
		ProfileSpec: pwm_profile.ProfileSpec{
			Type:   "loop",
			Config: []byte(`{"values":[5,120,60]}`),
		},
	}

	tests := []float64{0, 100, 60}
	for i, expected := range tests {
		v, err := ch.ValueAt(time.Now())
		if err != nil {
			t.Fatal(err)
		}
		if v != expected {
			t.Fatalf("iteration %d: expected %f, got %f", i, expected, v)
		}
	}
}

func TestChannelValueAtProfileError(t *testing.T) {
	t.Parallel()

	ch := Channel{
		Name: "bad-profile",
		ProfileSpec: pwm_profile.ProfileSpec{
			Type: "bogus",
		},
	}

	if _, err := ch.ValueAt(time.Now()); err == nil {
		t.Fatal("expected invalid profile to return an error")
	}
}

func TestLightLoadChannelsReturnsProfileError(t *testing.T) {
	t.Parallel()

	l := Light{
		Name: "bad-light",
		Channels: map[int]*Channel{
			1: {
				Name: "bad-channel",
				ProfileSpec: pwm_profile.ProfileSpec{
					Type: "bogus",
				},
			},
		},
	}

	err := l.LoadChannels()
	if err == nil {
		t.Fatal("expected invalid channel profile to fail")
	}
	if !strings.Contains(err.Error(), "bad-light") || !strings.Contains(err.Error(), "bad-channel") {
		t.Fatalf("expected light and channel names in error, got %q", err.Error())
	}
}
