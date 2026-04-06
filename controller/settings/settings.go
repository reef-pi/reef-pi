package settings

import (
	"fmt"
	"net"
)

//swagger:model settings
type Settings struct {
	Name         string            `json:"name"`
	Interface    string            `json:"interface"`
	Address      string            `json:"address"`
	Display      bool              `json:"display"`
	Notification bool              `json:"notification"`
	Capabilities Capabilities      `json:"capabilities"`
	HealthCheck  HealthCheckNotify `json:"health_check"`
	HTTPS        bool              `json:"https"`
	Pprof        bool              `json:"pprof"`
	RPI_PWMFreq  int               `json:"rpi_pwm_freq"`
	Prometheus   bool              `json:"prometheus"`
	CORS         bool              `json:"cors"`
}

func (s Settings) Validate() error {
	if _, _, err := net.SplitHostPort(s.Address); err != nil {
		return fmt.Errorf("invalid address %q: must be in host:port format (e.g. 0.0.0.0:80)", s.Address)
	}
	return nil
}

var DefaultSettings = Settings{
	Name:         "reef-pi",
	Interface:    "wlan0",
	Address:      "0.0.0.0:80",
	Capabilities: DefaultCapabilities,
	RPI_PWMFreq:  100,
	HealthCheck: HealthCheckNotify{
		MaxMemory: 500,
		MaxCPU:    2,
	},
}
