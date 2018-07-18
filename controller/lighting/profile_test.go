package lighting

import (
	"encoding/json"
	"testing"
	"time"
)

func TestProfile(t *testing.T) {
	var ch Channel
	d := DiurnalConfig{
		Start: "07:30",
		End:   "18:45",
	}
	d1, err := json.Marshal(&d)
	if err != nil {
		t.Fatal(err)
	}
	t1, err := time.Parse(TimeFormat, "07:00")
	if err != nil {
		t.Error(err)
	}
	ch.Profile.Type = "diurnal"
	ch.Profile.Config = d1
	for i := 0; i <= 5*12*4; i++ {
		ch.GetValue(t1)
		t1 = t1.Add(time.Duration(5) * time.Minute)
	}
}
