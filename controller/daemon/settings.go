package daemon

import (
	"log"
	"net/http"
	"os"
	"runtime"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func loadSettings(store storage.Store) (settings.Settings, error) {
	var s settings.Settings
	return s, store.Get(Bucket, "settings", &s)
}

func initializeSettings(store storage.Store) (settings.Settings, error) {
	if os.Getenv("DEV_MODE") == "1" || runtime.GOOS == "Windows" {
		settings.DefaultSettings.Capabilities.DevMode = true
		settings.DefaultSettings.Capabilities.Dashboard = true
		settings.DefaultSettings.Capabilities.Equipment = true
		settings.DefaultSettings.Capabilities.Timers = true
		settings.DefaultSettings.Capabilities.Lighting = true
		settings.DefaultSettings.Capabilities.Temperature = true
		settings.DefaultSettings.Capabilities.ATO = true
		settings.DefaultSettings.Capabilities.Macro = true
		settings.DefaultSettings.Capabilities.Doser = true
		settings.DefaultSettings.Capabilities.Ph = true

		settings.DefaultSettings.Address = "0.0.0.0:8080"
		log.Println("DEV_MODE environment variable set. Turning on dev_mode. Address set to localhost:8080")
	}
	if err := store.CreateBucket(Bucket); err != nil {
		log.Println("ERROR:Failed to create bucket:", Bucket, ". Error:", err)
		return settings.DefaultSettings, err
	}
	return settings.DefaultSettings, store.Update(Bucket, "settings", settings.DefaultSettings)
}

func (r *ReefPi) GetSettings(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		var s settings.Settings
		return &s, r.store.Get(Bucket, "settings", &s)
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) UpdateSettings(w http.ResponseWriter, req *http.Request) {
	var s settings.Settings
	fn := func(_ string) error {
		return r.store.Update(Bucket, "settings", s)
	}
	utils.JSONUpdateResponse(&s, fn, w, req)
}
