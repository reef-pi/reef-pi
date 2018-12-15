package settings

type Settings struct {
	Name            string            `json:"name"`
	Interface       string            `json:"interface"`
	Address         string            `json:"address"`
	Display         bool              `json:"display"`
	Notification    bool              `json:"notification"`
	Capabilities    Capabilities      `json:"capabilities"`
	HealthCheck     HealthCheckNotify `json:"health_check"`
	HTTPS           bool              `json:"https"`
	PCA9685         bool              `json:"pca9685"`
	Pprof           bool              `json:"pprof"`
	RPI_PWMFreq     int               `json:"rpi_pwm_freq"`
	PCA9685_PWMFreq int               `json:"pca9685_pwm_freq"`
	PCA9685_Address int               `json:"pca9685_address"`
}

var DefaultSettings = Settings{
	Name:            "reef-pi",
	Interface:       "wlan0",
	Address:         "0.0.0.0:80",
	Capabilities:    DefaultCapabilities,
	RPI_PWMFreq:     100,
	PCA9685_Address: 0x40,
	PCA9685_PWMFreq: 1500,
	HealthCheck: HealthCheckNotify{
		MaxMemory: 500,
		MaxCPU:    2,
	},
}
