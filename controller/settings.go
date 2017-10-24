package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
	"time"
)

type Capabilities struct {
	DevMode       bool `json:"dev_mode" yaml:"dev_mode"`
	Equipments    bool `json:"equipments" yaml:"equipments"`
	Lighting      bool `json:"lighting" yaml:"lighting"`
	Temperature   bool `json:"temperature" yaml:"temperature"`
	ATO           bool `json:"ato" yaml:"ato"`
	Timers        bool `json:"timers" yaml:"timers"`
	Configuration bool `json:"configuration" yaml:"configuration"`
	Camera        bool `json:"camera" yaml:"camera"`
	Doser         bool `json:"doser" yaml:"doser"`
}

type Settings struct {
	Name           string           `json:"name" yaml:"name"`
	Interface      string           `json:"interface" yaml:"interface"`
	Address        string           `json:"address" yaml:"address"`
	ImageDirectory string           `json:"image_directory" yaml:"image_directory"`
	Display        bool             `json:"display" yaml:"display"`
	AdafruitIO     utils.AdafruitIO `json:"adafruitio" yaml:"adafruitio"`
	LightInterval  time.Duration    `json:"light_interval" yaml:"light_interval"`
	Capabilities   Capabilities     `json:"capabilities" yaml:"capabilities"`
}

var DefaultSettings = Settings{
	Name:          "reef-pi",
	Interface:     "eth0",
	Address:       "0.0.0.0:8080",
	LightInterval: 30 * time.Second,
	Capabilities: Capabilities{
		DevMode:       true,
		Configuration: true,
		Equipments:    true,
		Lighting:      true,
		Temperature:   true,
		ATO:           true,
		Timers:        true,
		Camera:        true,
		Doser:         true,
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
