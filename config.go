package reefer

import (
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
)

type Config struct {
	ID              string   `yaml:"id"`
	Secret          string   `yaml:"secret"`
	CallbackUrl     string   `yaml:"callback_url"`
	GomniauthSecret string   `yaml:"gomniauth_secret"`
	Users           []string `yaml:"users"`
	Domain          string   `yaml:"domain"`
	ImageDirectory  string   `yaml:"image_directory"`
	TickInterval    uint     `yaml:"tick_interval"`
	AuthDomain      string   `yaml:"oauth_domain"`
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
