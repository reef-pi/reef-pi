package pwm_profile

import (
	"testing"
	"time"
)

func TestComposite(t *testing.T) {
	conf := `
{
  "profiles":[
	  {"type": "diurnal", "span": 300}, {"type": "fixed", "span": 150, "config":{"value": 0}}
	]
}
`
	p, err := Composite([]byte(conf), time.Now())
	if err != nil {
		t.Error(err)
	}
	p.Get(time.Now())
}
