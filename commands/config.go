package main

import (
	"github.com/ranjib/reefer/webui"
	"gopkg.in/yaml.v2"
	"io/ioutil"
)

type Config struct {
	Server webui.ServerConfig `yaml:"server"`
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
