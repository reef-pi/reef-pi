package camera

import (
	"bytes"
	"encoding/json"
	"github.com/reef-pi/reef-pi/controller/utils"
	"os"
	"path/filepath"
	"testing"
)

func TestCamera(t *testing.T) {
	store, err := utils.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	tr := utils.NewTestRouter()
	c, err := New(store)
	if err != nil {
		t.Fatal(err)
	}
	if err := c.Setup(); err != nil {
		t.Fatal(err)
	}
	c.LoadAPI(tr.Router)
	c.Start()
	if err := tr.Do("GET", "/api/camera/config", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to get camera config using api. Error:", err)
	}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(&Default)
	if err := tr.Do("POST", "/api/camera/config", body, nil); err != nil {
		t.Error("Failed to update camera config using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("GET", "/api/camera/list", body, nil); err != nil {
		t.Error("Failed to list images using api. Error:", err)
	}
	cwd, err := os.Getwd()
	if err != nil {
		t.Error(err)
	}
	p, err := filepath.Abs(cwd + "../../../test")
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
	c.Stop()
}
