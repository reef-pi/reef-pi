package camera

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
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
	Upload         bool          `json:"upload" yaml:"upload"`
}

var Default = Config{
	ImageDirectory: "/var/lib/reef-pi/images",
	TickInterval:   120,
}

func loadConfig(store utils.Store) (Config, error) {
	var conf Config
	return conf, store.Get(Bucket, "config", &conf)
}

func saveConfig(store utils.Store, conf Config) error {
	if conf.TickInterval <= 0 {
		return fmt.Errorf("Tick Interval for camera controller must be greater than zero")
	}
	if conf.ImageDirectory == "" {
		return fmt.Errorf("Image directory cant not be empty")
	}
	return store.Update(Bucket, "config", conf)
}

type Controller struct {
	config Config
	stopCh chan struct{}
	mu     sync.Mutex
	store  utils.Store
}

func New(store utils.Store) (*Controller, error) {
	return &Controller{
		config: Default,
		store:  store,
		mu:     sync.Mutex{},
		stopCh: make(chan struct{}),
	}, nil
}

func (c *Controller) Start() {
	go c.run()
}

func (c *Controller) run() {
	log.Println("Starting camera controller")
	ticker := time.NewTicker(c.config.TickInterval * time.Minute)
	for {
		select {
		case <-ticker.C:
			if !c.config.Enable {
				continue
			}
			img, err := c.Capture()
			if err != nil {
				log.Println("ERROR: camera subsystem: failed to capture image. Error:", err)
				continue
			}
			if c.config.Upload {
				c.uploadImage(img)
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
	if err := c.store.CreateBucket(Bucket); err != nil {
		return err
	}
	conf, err := loadConfig(c.store)
	if err != nil {
		log.Println("WARNING: camera config not found. Initializing default config")
		conf = Default
		if err := saveConfig(c.store, conf); err != nil {
			log.Println("ERROR: Failed to save camera config. Error:", err)
			return err
		}
	}
	c.config = conf
	return nil
}

func (c *Controller) Capture() (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	imgDir, pathErr := filepath.Abs(c.config.ImageDirectory)
	if pathErr != nil {
		return "", pathErr
	}
	imgName := time.Now().Format("15-04-05-Mon-Jan-2-2006.png")
	imgPath := filepath.Join(imgDir, imgName)
	command := "raspistill -e png " + c.config.CaptureFlags + " -o " + imgPath
	parts := strings.Fields(command)
	err := exec.Command(parts[0], parts[1:]...).Run()
	if err != nil {
		log.Println("ERROR: Failed to execute image capture command:", command, "Error:", err)
		return "", err
	}
	data := make(map[string]string)
	data["image"] = imgName
	log.Println("Camera subsystem: Image captured:", imgPath)
	return imgName, c.store.Update(Bucket, "latest", data)
}

func (c *Controller) uploadImage(imgName string) {
	imgDir, pathErr := filepath.Abs(c.config.ImageDirectory)
	if pathErr != nil {
		log.Println("ERROR: Failed to compute absolute image path. Error:", pathErr)
		return
	}
	imgPath := filepath.Join(imgDir, imgName)
	command := "drive push -quiet -destination reef-pi-images -files " + imgPath
	parts := strings.Fields(command)
	err := exec.Command(parts[0], parts[1:]...).Run()
	if err != nil {
		log.Println("ERROR: Failed to upload image. Command:", command, "Error:", err)
	}
}
