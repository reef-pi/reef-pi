package camera

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type Config struct {
	ImageDirectory    string        `yaml:"image_directory"`
	RaspiStillCommand string        `yaml:"capture_command"`
	CaptureFlags      string        `yaml:"capture_flags"`
	TickInterval      time.Duration `yaml:"tick_interval"`
}

type Camera struct {
	config Config
}

const (
	DefaulCaptureFlags = ""
)

func NewCamera(config Config) *Camera {
	return &Camera{
		config: config,
	}
}

func (c *Camera) CaptureImage() error {
	imageDir, pathErr := filepath.Abs(c.config.ImageDirectory)
	if pathErr != nil {
		return pathErr
	}
	filename := filepath.Join(imageDir, time.Now().Format("15-04-05-Mon-Jan-2-2006.png"))
	command := "raspistill -e png " + c.config.CaptureFlags + " -o " + filename
	parts := strings.Fields(command)
	err := exec.Command(parts[0], parts[1:]...).Run()
	if err != nil {
		return err
	}
	latest := filepath.Join(imageDir, "latest.png")
	os.Remove(latest)
	if err := os.Symlink(filename, latest); err != nil {
		return err
	}
	return nil
}
