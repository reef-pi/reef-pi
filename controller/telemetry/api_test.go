package telemetry

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestAPI(t *testing.T) {
	tr := utils.NewTestRouter()
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	store.CreateBucket("telemetry")
	store.Update("telemetry", DBKey, DefaultTelemetryConfig)
	tele := TestTelemetry(store)
	tr.Router.HandleFunc("/api/telemetry", tele.GetConfig).Methods("GET")
	tr.Router.HandleFunc("/api/telemetry", tele.UpdateConfig).Methods("POST")
	tr.Router.HandleFunc("/api/telemetry/test_message", tele.SendTestMessage).Methods("POST")
	body := new(bytes.Buffer)
	if err := tr.Do("GET", "/api/telemetry", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
	enc := json.NewEncoder(body)
	enc.Encode(&DefaultTelemetryConfig)
	if err := tr.Do("POST", "/api/telemetry", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("POST", "/api/telemetry/test_message", body, nil); err != nil {
		t.Fatal("Failed to config using api. Error:", err)
	}
}
