package pwm_profile

import (
	"encoding/json"
	"testing"
	"time"
)

func TestManual(t *testing.T) {
	spec := ProfileSpec{
		Name:   "test",
		Type:   "manual",
		Config: json.RawMessage(`{"value":34}`),
	}
	p, err := spec.CreateProfile()
	if err != nil {
		t.Error(err)
	}

	if p.Get(time.Now()) != 34 {
		t.Error("Expected 34. found:", p.Get(time.Now()))
	}
}
