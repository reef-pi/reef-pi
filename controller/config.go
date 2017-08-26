package controller

import (
	"github.com/reef-pi/reef-pi/auth"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/camera"
	"github.com/reef-pi/reef-pi/controller/equipments"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"github.com/reef-pi/reef-pi/controller/utils"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"net/http"
)

type Config struct {
	Name     string `json:"name" yaml:"name"`
	Database string `json:"database" yaml:"database"`
	DevMode  bool   `json:"dev_mode" yaml:"dev_mode"`

	Equipments  equipments.Config  `json:"equipments" yaml:"equipments"`
	Lighting    lighting.Config    `json:"lighting" yaml:"lighting"`
	Temperature temperature.Config `json:"temperature" yaml:"temperature"`
	ATO         ato.Config         `json:"ato" yaml:"ato"`
	Timers      timer.Config       `json:"timers" yaml:"timers"`
	System      system.Config      `json:"system" yaml:"system"`
	Camera      camera.Config      `json:"camera" yaml:"camera"`
	AdafruitIO  utils.AdafruitIO   `json:"adafruitio" yaml:"adafruitio"`
	API         API                `json:"api" yaml:"api"`
}

var DefaultConfig = Config{
	Database:   "reef-pi.db",
	Equipments: equipments.Config{},
	Lighting:   lighting.DefaultConfig,
	API: API{
		ImageDirectory: "images/",
		Address:        "localhost:8080",
	},
}

type API struct {
	EnableAuth     bool        `json:"enable_auth" yaml:"enable_auth"`
	Address        string      `json:"address" yaml:"address"`
	Auth           auth.Config `json:"auth" yaml:"auth"`
	ImageDirectory string      `json:"image_directory" yaml:"image_directory"`
}

func ParseConfig(filename string) (Config, error) {
	c := DefaultConfig
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return c, err
	}
	return c, yaml.Unmarshal(content, &c)
}

func (c *Config) loadFromDb(store utils.Store) error {
	var conf Config
	if err := store.Get(Bucket, "config", &conf); err != nil {
		log.Println("WARNING: config not found. Error:", err)
		log.Println("Initializing persistent config")
		return c.storeInDB(store)
	}
	c = &conf
	return nil
}

func (c *Config) storeInDB(store utils.Store) error {
	if err := store.CreateBucket(Bucket); err != nil {
		log.Println("ERROR:Failed to create bucket:", Bucket, ". Error:", err)
		return err
	}
	return store.Update(Bucket, "config", c)
}

func (r *ReefPi) GetConfig(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.config, nil
	}
	utils.JSONGetResponse(fn, w, req)
}
func (r *ReefPi) UpdateConfig(w http.ResponseWriter, req *http.Request) {
	var conf Config
	fn := func(_ string) error {
		return r.store.Update(Bucket, "config", conf)
	}
	utils.JSONUpdateResponse(&conf, fn, w, req)
}
