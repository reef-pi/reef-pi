package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

func initializeTelemetry(store utils.Store, notify bool) *utils.Telemetry {
	t := utils.DefaultTelemetryConfig
	if err := store.Get(Bucket, "telemetry", &t); err != nil {
		log.Println("ERROR: Failed to load telemtry config from saved settings. Initializing")
		store.Update(Bucket, "telemetry", t)
	}
	return utils.NewTelemetry(t)
}

func (r *ReefPi) getTelemetry(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		var t utils.TelemetryConfig
		if err := r.store.Get(Bucket, "telemetry", &t); err != nil {
			return nil, err
		}
		t.AdafruitIO.Token = ""
		t.Mailer.Password = ""
		return &t, nil
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) updateTelemetry(w http.ResponseWriter, req *http.Request) {
	var t utils.TelemetryConfig
	fn := func(_ string) error {
		return r.store.Update(Bucket, "telemetry", t)
	}
	utils.JSONUpdateResponse(&t, fn, w, req)
}
