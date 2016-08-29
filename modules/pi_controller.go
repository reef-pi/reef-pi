package modules

type Config struct {
	Relay1 uint `yaml:"relay_1"`
	Relay2 uint `yaml:"relay_1"`
}

type PiController struct {
	config  *Config
	devices map[string]Device
}

func (c *PiController) GetDevice(name string) (Device, error) {
	return &NullDevice{}, nil
}

func NewPiController() *PiController {
	return &PiController{}
}
