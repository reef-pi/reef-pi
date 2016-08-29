package modules

import (
	log "github.com/Sirupsen/logrus"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type CameraConfig struct {
	ImageDirectory    string        `yaml"image_directory"`
	RaspiStillCommand string        `yaml:"capture_command"`
	CaptureFlags      string        `yaml:"capture_flags"`
	TickInterval      time.Duration `yaml:"tick_interval"`
}

type Camera struct {
	ticker     *time.Ticker
	quitCh     chan struct{}
	runner     Runner
	controller Controller
	config     CameraConfig
}

const (
	DefaulCaptureFlags = ""
)

func NewCamera(config CameraConfig, controller Controller) *Camera {
	return &Camera{
		controller: controller,
		config:     config,
		ticker:     time.NewTicker(config.TickInterval * time.Second),
		quitCh:     make(chan struct{}),
		runner:     &CommandRunner{},
	}
}

func (c *Camera) On() {
	log.Debug("Starting camera module")
	for {
		select {
		case <-c.ticker.C:
			c.Photoshoot()
		case <-c.quitCh:
			c.ticker.Stop()
			return
		}
	}
}

func (c *Camera) Photoshoot() error {
	return c.takeStill()
}

func (c *Camera) takeStill() error {
	imageDir, pathErr := filepath.Abs(c.config.ImageDirectory)
	if pathErr != nil {
		return pathErr
	}
	filename := filepath.Join(imageDir, time.Now().Format("15-04-05-Mon-Jan-2-2006.png"))
	command := "raspistill -e png " + c.config.CaptureFlags + " -o " + filename
	log.Debugln("Executing:", command)
	parts := strings.Fields(command)
	err := c.runner.Run(parts[0], parts[1:]...)
	if err != nil {
		log.Errorln(err)
		return err
	}
	log.Debugln("Snapshot captured: ", filename)
	latest := filepath.Join(imageDir, "latest.png")
	os.Remove(latest)
	if err := os.Symlink(filename, latest); err != nil {
		log.Errorln(err)
		return err
	}
	return nil
}

func (c *Camera) Off() {
	c.quitCh <- struct{}{}
}
