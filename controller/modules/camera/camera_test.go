package camera

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestCamera(t *testing.T) {
	con, err := utils.TestController()
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	c, err := New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	c.LoadAPI(tr.Router)
	if err := tr.Do("GET", "/api/camera/config", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get camera config using api. Error:", err)
	}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&Default)
	c.Start()
	if err := tr.Do("POST", "/api/camera/config", body, nil); err != nil {
		t.Error("Failed to update camera config using api. Error:", err)
	}
	c.Stop()
	if err := tr.Do("POST", "/api/camera/shoot", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to photo shoot using api. Error:", err)
	}

	if err := tr.Do("GET", "/api/camera/latest", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get latest image using api. Error:", err)
	}

	cwd, err := os.Getwd()
	if err != nil {
		t.Error(err)
	}
	p, err := filepath.Abs(cwd + "../../../../test")
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
	body.Reset()
	if err := tr.Do("GET", "/api/camera/list", body, nil); err != nil {
		t.Error("Failed to list images using api. Error:", err)
	}

	c.uploadImage(images[0])
	c.run()
	c.config.Enable = true
	c.config.Upload = true
	c.run()
	conf := c.config
	conf.TickInterval = -1
	if err := saveConfig(con.Store(), conf); err == nil {
		t.Error("config should not be saved if period is negative")
	}
	conf = c.config
	conf.ImageDirectory = ""
	if err := saveConfig(con.Store(), conf); err == nil {
		t.Error("config should not be saved if image directory is empty")
	}
	if err := c.On("1", true); err == nil {
		t.Error("Camera should return error to On API")
	}
}
