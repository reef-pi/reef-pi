package modules

import (
	"fmt"
	log "github.com/Sirupsen/logrus"
	"os/exec"
	"strings"
	"time"
)

type CameraWorker struct {
	ticker         *time.Ticker
	quitCh         chan struct{}
	ImageDirectory string
}

func NewCameraWorker(imageDirectory string, tickInterval time.Duration) *CameraWorker {
	return &CameraWorker{
		ticker:         time.NewTicker(tickInterval * time.Second),
		quitCh:         make(chan struct{}),
		ImageDirectory: imageDirectory,
	}
}

func (w *CameraWorker) On() {
	log.Info("Starting camera module")
	for {
		select {
		case <-w.ticker.C:
			w.takeStill()
		case <-w.quitCh:
			w.ticker.Stop()
			return
		}
	}
}

func (w *CameraWorker) takeStill() {
	filename := fmt.Sprintf("%s-%d")
	command := "raspistill -w 800 -h 600 -o " + w.ImageDirectory + "/" + filename
	parts := strings.Fields(command)
	cmd := exec.Command(parts[0], parts[1:]...)
	err := cmd.Run()
	if err != nil {
		log.Println(err)
		return
	}
}

func (w *CameraWorker) Off() {
	w.quitCh <- struct{}{}
}
