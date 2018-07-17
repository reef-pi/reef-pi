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
		t.Fatal(err)
	}
	ch.Profile.Config = d

	if err := ValidateValues(a.Values); err != nil {
		t.Fatal(err)
	}
	t1 := time.Date(2015, time.October, 12, 7, 0, 0, 0, time.UTC)
	v := ch.GetValue(t1)
	if v != 10 {
		t.Fatal("Expected 10, found:", v)
	}
}
