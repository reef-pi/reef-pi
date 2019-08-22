package pwm_profile

import (
	"testing"
)

func TestCreateProfile(t *testing.T) {
	specs := make(map[string][]byte)
	specs["auto"] = []byte(`{"values":[0,0,0,0,0,0,0,0,0,0,0,0]}`)
	specs["manual"] = []byte(`{"value":0}`)
	specs["fixed"] = []byte(`{"value":0}`)
	specs["loop"] = []byte(`{"values":[0,12]}`)
	specs["diurnal"] = []byte(`{"start": "07:05", "end":"16:00"}`)
	for pType, pConf := range specs {
		spec := ProfileSpec{
			Name:   "test",
			Min:    12,
			Max:    89,
			Type:   pType,
			Config: pConf,
		}
		_, err := spec.CreateProfile()
		if err != nil {
			t.Error(err)
		}
	}
	spec := ProfileSpec{
		Name: "test",
		Min:  12,
		Max:  89,
		Type: "bogus",
	}
	if _, err := spec.CreateProfile(); err == nil {
		t.Error("Invalid profile should trigger error")
	}
}
