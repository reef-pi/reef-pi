package reefer

import (
	"github.com/ranjib/reefer/controller"
	"github.com/ranjib/reefer/modules"
	"github.com/ranjib/reefer/webui"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"time"
)

type WaterLevelSensor struct {
	On       bool          `yaml:"on"`
	Pin      int           `yaml:"pin"`
	Interval time.Duration `yaml:"interval"`
}

type Config struct {
	Camera    modules.CameraConfig   `yaml:"camera"`
	Server    webui.ServerConfig     `yaml:"server"`
	PinLayout controller.RaspiConfig `yaml:"pin_layout"`
}

func ParseConfig(filename string) (*Config, error) {
	var c Config
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatal("Failed to read config file. ", err)
		return nil, err
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		log.Fatal("Failed to unmarshal yaml file ", err)
		return nil, err
	}
	return &c, nil
}

func DefaultConfig() Config {
	var config Config
	config.PinLayout = controller.DefaultRaspiConfig()
	return config
}
