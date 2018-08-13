package camera

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const Bucket = types.CameraBucket
const ItemBucket = types.CameraItemBucket

type Controller struct {
	config  Config
	stopCh  chan struct{}
	mu      sync.Mutex
	store   types.Store
	DevMode bool
}

func New(store types.Store, devMode bool) (*Controller, error) {
	return &Controller{
		config:  Default,
		store:   store,
		mu:      sync.Mutex{},
		DevMode: devMode,
		stopCh:  make(chan struct{}),
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
		return
	}
	if err := c.Process(img); err != nil {
		log.Println("ERROR: camera sub-system : Failed to process image. Error:", err)
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
	c.mu.Lock()
	c.config = conf
	c.mu.Unlock()
	if err := c.store.CreateBucket(ItemBucket); err != nil {
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
	err := utils.Command(parts[0], parts[1:]...).WithDevMode(c.DevMode).Run()
	if err != nil {
		log.Println("ERROR: Failed to upload image. Command:", command, "Error:", err)
	}
}
