package lighting

import (
	"encoding/json"
	"testing"
	"time"
)

func TestGetValue(t *testing.T) {
	a := AutoConfig{
		Values: []int{0, 0, 0, 0, 20, 40, 60, 70, 30, 10, 0, 0},
	}
	var ch Channel
	ch.Profile.Type = "auto"
	d, err := json.Marshal(&a)
	if err != nil {
		t.Error(err)
	}
	ch.Profile.Config = d

	if err := ValidateValues(a.Values); err != nil {
		t.Error(err)
	}
	a.Values = []int{0, 0, 0, 0, 20, 40, 60, 70, 30, 10, 0}
	if err := ValidateValues(a.Values); err == nil {
		t.Error("Validation should fail if there are not exactly 12 values")
	}
	a.Values = []int{0, 0, 0, 0, 20, 40, 60, 70, 130, 10, 0, 0}
	if err := ValidateValues(a.Values); err == nil {
		t.Error("Validation should fail if any of the value is above 100")
	}
	t1 := time.Date(2015, time.October, 12, 7, 0, 0, 0, time.UTC)
	v := ch.GetValue(t1)
	if v != 10 {
		t.Error("Expected 10, found:", v)
	}
}
