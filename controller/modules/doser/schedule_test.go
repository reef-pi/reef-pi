package doser

import "testing"

func TestScheduleValidate(t *testing.T) {
	t.Parallel()

	valid := []Schedule{
		// basic fixed values
		{Second: "0", Minute: "0", Hour: "0", Day: "*", Month: "*", Week: "*"},
		// interval notation (*/N) — regression for issue #1978
		{Second: "0", Minute: "*/15", Hour: "*", Day: "*", Month: "*", Week: "*"},
		{Second: "*/30", Minute: "*", Hour: "*", Day: "*", Month: "*", Week: "*"},
		{Second: "0", Minute: "*", Hour: "*/2", Day: "*", Month: "*", Week: "*"},
		// list notation
		{Second: "0", Minute: "0,15,30,45", Hour: "*", Day: "*", Month: "*", Week: "*"},
		// range notation
		{Second: "0", Minute: "0-30", Hour: "*", Day: "*", Month: "*", Week: "*"},
	}

	for _, s := range valid {
		if err := s.Validate(); err != nil {
			t.Errorf("expected valid schedule %+v to pass, got: %v", s, err)
		}
	}

	invalid := []Schedule{
		// empty second field is required
		{Second: "", Minute: "0", Hour: "0", Day: "*", Month: "*", Week: "*"},
		// out-of-range minute
		{Second: "0", Minute: "99", Hour: "0", Day: "*", Month: "*", Week: "*"},
	}

	for _, s := range invalid {
		if err := s.Validate(); err == nil {
			t.Errorf("expected invalid schedule %+v to fail validation", s)
		}
	}
}
