package controller

type Config struct {
	EnableGPIO              bool              `yaml:"enable_gpio"`
	EnablePWM               bool              `yaml:"enable_pwm"`
	EnableADC               bool              `yaml:"enable_adc"`
	EnableTemperatureSensor bool              `yaml:"enable_temperature_sensor"`
	HighRelay               bool              `yaml:"high_relay"`
	Database                string            `yaml:"database"`
	TemperaturePin          int               `yaml:"temperature_pin"`
	Outlets                 map[string]Outlet `yaml:"outlets"`
}

var DefaultConfig = Config{
	Database:       "reef-pi.db",
	EnableGPIO:     true,
	TemperaturePin: 0,
	Outlets:        make(map[string]Outlet),
}
