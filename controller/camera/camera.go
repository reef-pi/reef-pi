package camera

import (
	"github.com/gorilla/mux"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const Bucket = "camera"

type Config struct {
	Enable         bool          `yaml:"enable"`
	ImageDirectory string        `yaml:"image_directory"`
	CaptureFlags   string        `yaml:"capture_flags"`
	TickInterval   time.Duration `yaml:"tick_interval"`
}

type Camera struct {
	config Config
}

const (
	DefaulCaptureFlags = ""
)

func New(config Config) *Camera {
	return &Camera{
		config: config,
	}
}

func (c *Camera) Start() {
}

func (c *Camera) Stop() {
}

func (c *Camera) Setup() error {
	return nil
}

func (c *Camera) LoadAPI(r *mux.Router) {
}

func (c *Camera) Capture() error {
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
