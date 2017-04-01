package controller

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

type CameraConfig struct {
	ImageDirectory    string        `yaml:"image_directory"`
	RaspiStillCommand string        `yaml:"capture_command"`
	CaptureFlags      string        `yaml:"capture_flags"`
	TickInterval      time.Duration `yaml:"tick_interval"`
}

type Camera struct {
	config CameraConfig
}

const (
	DefaulCaptureFlags = ""
)

func NewCamera(config CameraConfig) *Camera {
	return &Camera{
		config: config,
	}
}

func (c *Camera) On() error {
	return c.CaptureImage()
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

func (c *Camera) Off() error {
	return nil
}
