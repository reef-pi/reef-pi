package pwm_profile

import (
	"testing"
)

func TestCreateProfile(t *testing.T) {
	specs := make(map[string][]byte)
	specs["auto"] = []byte(`{"values":[0,0,0,0,0,0,0,0,0,0,0,0]}`)
	specs["fixed"] = []byte(`{"value":0, "start":"07:05:00","end":"16:00:00"}`)
	specs["loop"] = []byte(`{"values":[0,12]}`)
	specs["diurnal"] = []byte(`{"start": "07:05:00", "end":"16:00:00"}`)
	specs["composite"] = []byte(`{"start": "07:05:00", "end":"16:00:00"}`)
	specs["lunar"] = []byte(`{"start": "07:05:00", "end":"16:00:00", "full_moon":"Jan 2 2024"}`)
	specs["sine"] = []byte(`{"start": "07:05:00", "end":"16:00:00"}`)
	specs["random"] = []byte(`{"start": "07:05:00", "end":"16:00:00"}`)
	for pType, pConf := range specs {
		spec := ProfileSpec{
			Min:    12,
			Max:    89,
			Type:   pType,
			Config: pConf,
		}
		prof, err := spec.CreateProfile()
		if err != nil {
			t.Error("Error creating ", pType, "profile", err)
		}
		prof.Name()
	}
	spec := ProfileSpec{
		Min:  12,
		Max:  89,
		Type: "bogus",
	}
	if _, err := spec.CreateProfile(); err == nil {
		t.Error("Invalid profile should trigger error")
	}
}
