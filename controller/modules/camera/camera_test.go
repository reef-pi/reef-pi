package camera

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestCamera(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}

	// GetConfig
	_ = c.GetConfig()

	// SaveConfig
	c.Start()
	if err := c.SaveConfig(Default); err != nil {
		t.Error("Failed to save camera config:", err)
	}
	c.Stop()

	// Capture (shoot)
	if _, err := c.Capture(); err != nil {
		t.Error("Failed to capture image:", err)
	}

	// GetLatest
	if _, err := c.GetLatest(); err != nil {
		t.Error("Failed to get latest image:", err)
	}

	cwd, err := os.Getwd()
	if err != nil {
		t.Error(err)
	}
	p, err := filepath.Abs(cwd + "../../../../front-end/test")
	if err != nil {
		t.Error(err)
	}

	c.config.ImageDirectory = filepath.Join(p, "images")
	images, err := filepath.Glob(filepath.Join(p, "images") + "/*.png")
	if err != nil {
		t.Error(err)
	}
	for _, image := range images {
		if err := c.Process(filepath.Base(image)); err != nil {
			t.Error(image, err)
		}
		break
	}

	// ListImages
	if _, err := c.ListImages(); err != nil {
		t.Error("Failed to list images:", err)
	}

	c.uploadImage(images[0])
	c.run()
	c.config.Enable = true
	c.config.Upload = true
	c.run()
	conf := c.config
	conf.TickInterval = -1
	if err := c.repo.SaveConfig(conf); err == nil {
		t.Error("config should not be saved if period is negative")
	}
	conf = c.config
	conf.ImageDirectory = ""
	if err := c.repo.SaveConfig(conf); err == nil {
		t.Error("config should not be saved if image directory is empty")
	}
	if err := c.On("1", true); err == nil {
		t.Error("Camera should return error to On API")
	}
}
