package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
	"time"
)

type Settings struct {
	Name           string            `json:"name" yaml:"name"`
	Interface      string            `json:"interface" yaml:"interface"`
	Address        string            `json:"address" yaml:"address"`
	ImageDirectory string            `json:"image_directory" yaml:"image_directory"`
	Display        bool              `json:"display" yaml:"display"`
	Notification   bool              `json:"notification,yaml:"notification""`
	AdafruitIO     utils.AdafruitIO  `json:"adafruitio" yaml:"adafruitio"`
	LightInterval  time.Duration     `json:"light_interval" yaml:"light_interval"`
	Capabilities   Capabilities      `json:"capabilities" yaml:"capabilities"`
	HealthCheck    HealthCheckNotify `json:"health_check" yaml:"health_check"`
}

var DefaultSettings = Settings{
	Name:          "reef-pi",
	Interface:     "eth0",
	Address:       "0.0.0.0:8080",
	LightInterval: 30 * time.Second,
	Capabilities:  DefaultCapabilities,
	HealthCheck: HealthCheckNotify{
		MaxMemory: 500,
		MaxCPU:    2,
	},
}

func loadSettings(store utils.Store) (Settings, error) {
	var s Settings
	if err := store.Get(Bucket, "settings", &s); err != nil {
		return s, err
	}
	return s, nil
}

func initializeSettings(store utils.Store) error {
	if err := store.CreateBucket(Bucket); err != nil {
		log.Println("ERROR:Failed to create bucket:", Bucket, ". Error:", err)
		return err
	}
	return store.Update(Bucket, "settings", DefaultSettings)
}

func (r *ReefPi) GetSettings(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		var s Settings
		return &s, r.store.Get(Bucket, "settings", &s)
	}
	utils.JSONGetResponse(fn, w, req)
}

func (r *ReefPi) UpdateSettings(w http.ResponseWriter, req *http.Request) {
	var s Settings
	fn := func(_ string) error {
		return r.store.Update(Bucket, "settings", s)
	}
	utils.JSONUpdateResponse(&s, fn, w, req)
}
