package pwm_profile

import (
	"encoding/json"
	"testing"
	"time"
)

func TestLoop(t *testing.T) {
	spec := ProfileSpec{
		Name:   "test",
		Type:   "loop",
		Config: json.RawMessage(`{"values":[21, 31, 34]}`),
	}

	p, err := spec.CreateProfile()
	if err != nil {
		t.Error(err)
	}

	now := time.Now()
	v := p.Get(now)
	if v != 21 {
		t.Error("Expected 21.Found", v)
	}
	v = p.Get(now)
	if v != 31 {
		t.Error("Expected 31.Found", v)
	}
	v = p.Get(now)
	if v != 34 {
		t.Error("Expected 34.Found", v)
	}
	v = p.Get(now)
	if v != 21 {
		t.Error("Expected 21.Found", v)
	}

}
