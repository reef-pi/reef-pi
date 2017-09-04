package camera

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const Bucket = "camera"
const DefaulCaptureFlags = ""

type Config struct {
	Enable         bool          `json:"enable" yaml:"enable"`
	ImageDirectory string        `json:"image_directory" yaml:"image_directory"`
	CaptureFlags   string        `json:"capture_flags" yaml:"capture_flags"`
	TickInterval   time.Duration `json:"tick_interval" yaml:"tick_interval"`
}

func loadConfig(store utils.Store) Config {
	var conf Config
	if err := store.Get(Bucket, "config", &conf); err != nil {
		log.Println("WARNING: camera config not found. Using default config")
		conf = Config{
			TickInterval: 120,
		}
	}
	return conf
}

type Controller struct {
	config Config
	stopCh chan struct{}
	mu     sync.Mutex
	store  utils.Store
}

func New(store utils.Store) (*Controller, error) {
	config := loadConfig(store)
	if config.TickInterval <= 0 {
		return nil, fmt.Errorf("Tick Interval for camera controller must be greater than zero")
	}
	return &Controller{
		config: config,
		store:  store,
		mu:     sync.Mutex{},
		stopCh: make(chan struct{}),
	}, nil
}

func (c *Controller) Start() {
	go c.run()
}

func (c *Controller) run() {
	log.Println("Starting Camera controller")
	ticker := time.NewTicker(c.config.TickInterval * time.Minute)
	for {
		select {
		case <-ticker.C:
			if !c.config.Enable {
				continue
			}
			if _, err := c.Capture(); err != nil {
				log.Println("ERROR: camera subsystem: failed to capture image. Error:", err)
			}
		case <-c.stopCh:
			log.Println("Stopping camera controller")
			ticker.Stop()
			return
		}
	}
}

func (c *Controller) Stop() {
	c.stopCh <- struct{}{}
}

func (c *Controller) Setup() error {
	return c.store.CreateBucket(Bucket)
}

func (c *Controller) Capture() (string, error) {
	imageDir, pathErr := filepath.Abs(c.config.ImageDirectory)
	if pathErr != nil {
		return "", pathErr
	}
	filename := filepath.Join(imageDir, time.Now().Format("15-04-05-Mon-Jan-2-2006.png"))
	command := "raspistill -e png " + c.config.CaptureFlags + " -o " + filename
	parts := strings.Fields(command)
	err := exec.Command(parts[0], parts[1:]...).Run()
	if err != nil {
		return "", err
	}
	latest := filepath.Join(imageDir, "latest.png")
	os.Remove(latest)
	if err := os.Symlink(filename, latest); err != nil {
		return "", err
	}
	data := make(map[string]string)
	data["latest"] = filename
	return filename, c.store.Update(Bucket, "latest", data)
}
