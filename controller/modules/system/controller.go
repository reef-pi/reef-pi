package system

import (
	"fmt"
	"strings"

	"github.com/shirou/gopsutil/v4/host"

	"github.com/reef-pi/reef-pi/controller"
)

const Bucket = "system"

type Config struct {
	Interface       string `json:"interface"`
	Name            string `json:"name"`
	Display         bool   `json:"display"`
	DevMode         bool   `json:"dev_mode"`
	Version         string `json:"version"`
	Pprof           bool   `json:"pprof"`
	RPI_PWMFreq     int    `json:"rpi_pwm_freq"`
	PCA9685_PWMFreq int    `json:"pca9685_pwm_freq"`
}

type Controller struct {
	config                    Config
	c                         controller.Controller
	PowerFile, BrightnessFile string
	isRaspberryPi             bool
	model, ip                 string
}

func New(conf Config, c controller.Controller) *Controller {
	con := &Controller{
		config:         conf,
		c:              c,
		PowerFile:      PowerFile,
		BrightnessFile: BrightnessFile,
	}
	stats, err := host.Info()
	if err == nil && strings.HasPrefix(stats.KernelArch, "arm") {
		con.isRaspberryPi = true
	}
	con.ip = HostIP(conf.Interface)
	con.model = GetModel()
	return con
}

func (c *Controller) Start() {
	c.logStartTime()
}

func (c *Controller) Stop() {
	c.logStopTime()
}

func (c *Controller) Setup() error {
	return c.c.Store().CreateBucket(Bucket)
}
func (c *Controller) On(id string, on bool) error {
	return nil
}

func (c *Controller) InUse(_, _ string) ([]string, error) { return []string{}, nil }
func (c *Controller) GetEntity(id string) (controller.Entity, error) {
	return nil, fmt.Errorf("system subsystem does not support 'GetEntity' interface")
}
