package reefer

import (
	"github.com/ranjib/reefer/modules"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"time"
)

type Auth struct {
	ID              string   `yaml:"id"`
	Secret          string   `yaml:"secret"`
	Domain          string   `yaml:"domain"`
	CallbackUrl     string   `yaml:"callback_url"`
	Users           []string `yaml:"users"`
	GomniAuthSecret string   `yaml:"gomni_auth_secret"`
}

type Camera struct {
	On             bool          `yaml:"on"`
	ImageDirectory string        `yaml:"image_directory"`
	TickInterval   time.Duration `yaml:"tick_interval"`
	CaptureFlags   string        `yaml:"capture_flags"`
}

type Config struct {
	Camera     Camera       `yaml:"camera"`
	Auth       Auth         `yaml:"auth"`
	ReturnPump modules.Pump `yaml:"return_pump"`
	PowerHead  modules.Pump `yaml:"recirculation_pump"`
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
