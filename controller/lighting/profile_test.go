package lighting

import (
	"fmt"
	"testing"
	"time"
)

func TestDiurnalProfile(t *testing.T) {
	intensity := Channel{
		Min:      13,
		StartMin: 1,
		Max:      100,
		Profile: Profile{
			Type: "diurnal",
			Config: []byte(
				`{"start":"10:00",
		 "end":"19:30"}`),
		},
	}
	spectrum := Channel{
		Min:      0,
		StartMin: 1,
		Max:      100,
		Profile: Profile{
			Type: "diurnal",
			Config: []byte(
				`{"start":"19:00",
		 "end":"04:30"}`),
		},
	}
	if err := assertValues("1:30", intensity, spectrum, 0, 100); err != nil {
		t.Error(err)
	}
	if err := assertValues("3:30", intensity, spectrum, 0, 50.856847); err != nil {
		t.Error(err)
	}
	if err := assertValues("5:30", intensity, spectrum, 0, 0); err != nil {
		t.Error(err)
	}

	if err := assertValues("11:20", intensity, spectrum, 77.647580, 0); err != nil {
		t.Error(err)
	}

	if err := assertValues("18:00", intensity, spectrum, 85.764991, 0); err != nil {
		t.Error(err)
	}

	if err := assertValues("21:10", intensity, spectrum, 0, 99.740869); err != nil {
		t.Error(err)
	}
}

func assertValues(t string, ch1, ch2 Channel, v1, v2 float64) error {
	s, err := time.Parse(TimeFormat, t)
	if err != nil {
		return err
	}
	if v := ch1.GetValue(s); int(v) != int(v1) {
		return fmt.Errorf("First channel value is wrong. Execpected %f found: %f", v1, v)
	}
	if v := ch2.GetValue(s); int(v) != int(v2) {
		return fmt.Errorf("Second channel value is wrong. Execpected %f found: %f", v2, v)
	}
	return nil
}
