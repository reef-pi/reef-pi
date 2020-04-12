package pwm_profile

import (
	"testing"
	"time"
)

func TestComposite(t *testing.T) {
	conf := `
{
  "profiles":[
	  {"type": "diurnal", "span": 300},
	  {"type": "random", "span": 300},
	  {"type": "interval", "span": 300,"config":{"interval":7200, "values":[0]}},
		{"type": "fixed", "span": 150, "config":{"value": 13}}
	]
}
`
	start, err := time.Parse(tFormat, "07:30:00")
	if err != nil {
		t.Error(err)
		return
	}
	p, err := Composite([]byte(conf), start, 0, 100)
	if err != nil {
		t.Error(err)
	}
	v := p.Get(start.Add(10 * time.Second))
	if v != 6.413505085590909 {
		t.Error("Expected  6.413505085590909. found:", v)
	}
	v = p.Get(start.Add(time.Minute))
	if v != 97.04915028125262 {
		t.Error("Expected 97.04915028125262. found:", v)
	}
	v = p.Get(start.Add(6 * time.Minute))
	if v != 85.31 {
		t.Error("Expected 13. found:", v)
	}
}
