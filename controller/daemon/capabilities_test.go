package daemon

import (
	"bytes"
	"encoding/json"
	"net/http"

	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func Test_Capabilities(t *testing.T) {
	http.DefaultServeMux = new(http.ServeMux)
	store, err := storage.NewStore("capabilities-test.db")
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	tele := telemetry.TestTelemetry(store)
	r := &ReefPi{
		a:          utils.NewAuth(Bucket, store),
		telemetry:  tele,
		dm:         device_manager.New(settings.DefaultSettings, store, tele),
		subsystems: controller.NewSubsystemComposite(),
	}
	buf := new(bytes.Buffer)
	buf.Write([]byte(`{}`))
	tr := utils.NewTestRouter()
	r.UnAuthenticatedAPI(tr.Router)
	r.AuthenticatedAPI(tr.Router)
	if err := tr.Do("GET", "/api/capabilities", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to fetch capabilities ror:", err)
	}
	var resp settings.Capabilities
	if err := json.NewDecoder(buf).Decode(&resp); err != nil {
		t.Error(err)
	}
}
