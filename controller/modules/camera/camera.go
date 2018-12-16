package camera

import (
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

const Bucket = storage.CameraBucket
const ItemBucket = storage.CameraItemBucket

type Controller struct {
	config  Config
	stopCh  chan struct{}
	mu      sync.Mutex
	DevMode bool
	c       controller.Controller
}

func New(devMode bool, c controller.Controller) (*Controller, error) {
	return &Controller{
		config:  Default,
		mu:      sync.Mutex{},
		DevMode: devMode,
		stopCh:  make(chan struct{}),
		c:       c,
	}, nil
}

func (c *Controller) On(id string, b bool) error {
	return fmt.Errorf("Camera subsystem does not support 'on' interface")
}

func (c *Controller) Start() {
	go c.runPeriodically()
}

func (c *Controller) run() {
	if !c.config.Enable {
		return
	}
	img, err := c.Capture()
	if err != nil {
		log.Println("ERROR: camera subsystem: failed to capture image. Error:", err)
		c.c.LogError("camera-capture", "Failed to capture image. Error:"+err.Error())
		return
	}
	if err := c.Process(img); err != nil {
		log.Println("ERROR: camera sub-system : Failed to process image. Error:", err)
		c.c.LogError("camera-process", "Failed to process image. Error:"+err.Error())
	}
	if c.config.Upload {
		c.uploadImage(img)
	}
}

func (c *Controller) runPeriodically() {
	log.Println("Starting camera controller")
	ticker := time.NewTicker(c.config.TickInterval * time.Minute)
	for {
		select {
		case <-ticker.C:
			c.run()
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
	if err := c.c.Store().CreateBucket(Bucket); err != nil {
		return err
	}
	conf, err := loadConfig(c.c.Store())
	if err != nil {
		log.Println("WARNING: camera config not found. Initializing default config")
		conf = Default
		if err := saveConfig(c.c.Store(), conf); err != nil {
			log.Println("ERROR: Failed to save camera config. Error:", err)
			return err
		}
	}
	c.mu.Lock()
	c.config = conf
	c.mu.Unlock()
	if err := c.c.Store().CreateBucket(ItemBucket); err != nil {
		return err
	}
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
	err := utils.Command(parts[0], parts[1:]...).WithDevMode(c.DevMode).Run()
	if err != nil {
		log.Println("ERROR: Failed to execute image capture command:", command, "Error:", err)
		return "", err
	}
	data := make(map[string]string)
	data["image"] = imgName
	log.Println("Camera subsystem: Image captured:", imgPath)
	return imgName, c.c.Store().Update(Bucket, "latest", data)
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
	err := utils.Command(parts[0], parts[1:]...).WithDevMode(c.DevMode).Run()
	if err != nil {
		log.Println("ERROR: Failed to upload image. Command:", command, "Error:", err)
	}
}
