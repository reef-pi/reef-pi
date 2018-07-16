package lighting

import (
	"testing"
	"time"
)

func TestProfile(t *testing.T) {
	d := DiurnalConfig{
		Start: "07:30",
		End:   "18:45",
		Min:   14,
		Max:   80,
	}
	t1, err := time.Parse(TimeFormat, "07:00")
	if err != nil {
		t.Error(err)
	}
	for i := 0; i <= 5*12*4; i++ {
		d.GetValue(t1)
		t1 = t1.Add(time.Duration(5) * time.Minute)
	}
}
