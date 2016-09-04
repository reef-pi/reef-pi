package main

import (
	"github.com/ranjib/reefer/controller"
	"github.com/ranjib/reefer/webui"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

type Config struct {
	Camera    controller.CameraConfig `yaml:"camera"`
	Server    webui.ServerConfig      `yaml:"server"`
	PinLayout controller.RaspiConfig  `yaml:"pin_layout"`
}

func ParseConfig(filename string) (*Config, error) {
	var c Config
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		return nil, err
	}
	return &c, nil
}

func DefaultConfig() Config {
	var config Config
	config.PinLayout = controller.DefaultRaspiConfig()
	return config
}
