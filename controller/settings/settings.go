package settings

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
}

var DefaultSettings = Settings{
	Name:         "reef-pi",
	Interface:    "wlan0",
	Address:      "0.0.0.0:8080",
	Capabilities: DefaultCapabilities,
	RPI_PWMFreq:  100,
	HealthCheck: HealthCheckNotify{
		MaxMemory: 500,
		MaxCPU:    2,
	},
}
