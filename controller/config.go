package controller

import (
	"io/ioutil"

	yaml "gopkg.in/yaml.v2"
)

type Config struct {
	Database string `json:"database" yaml:"database"`
}

var DefaultConfig = Config{
	Database: "reef-pi.db",
}

func ParseConfig(filename string) (Config, error) {
	c := DefaultConfig
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return c, err
	}
	return c, yaml.Unmarshal(content, &c)
}
