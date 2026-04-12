package daemon

import (
	"fmt"
	"os"

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
	content, err := os.ReadFile(filename)
	if err != nil {
		return c, fmt.Errorf("read config %q: %w", filename, err)
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		return c, fmt.Errorf("parse config %q: %w", filename, err)
	}
	return c, nil
}
