package modules

import (
	log "github.com/Sirupsen/logrus"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Camera struct {
	ticker            *time.Ticker
	quitCh            chan struct{}
	runner            Runner
	controller        Controller
	ImageDirectory    string
	RaspiStillCommand string
	CaptureFlags      string
}

const (
	DefaulCaptureFlags = ""
)

func NewCamera(controller Controller, imageDirectory string, tickInterval time.Duration) *Camera {
	return &Camera{
		controller:     controller,
		ticker:         time.NewTicker(tickInterval * time.Second),
		quitCh:         make(chan struct{}),
		runner:         &CommandRunner{},
		ImageDirectory: imageDirectory,
		CaptureFlags:   DefaulCaptureFlags,
	}
}

func (w *Camera) On() {
	log.Info("Starting camera module")
	for {
		select {
		case <-w.ticker.C:
			w.Photoshoot()
		case <-w.quitCh:
			w.ticker.Stop()
			return
		}
	}
}

func (w *Camera) Photoshoot() error {
	if err := w.controller.ReturnPump().Off(); err != nil {
		return err
	}
	defer w.controller.ReturnPump().On()
	if err := w.controller.ReCirculator().Off(); err != nil {
		return err
	}
	defer w.controller.ReCirculator().On()
	w.controller.CoolOff()
	return w.takeStill()
}

func (w *Camera) takeStill() error {
	imageDir, pathErr := filepath.Abs(w.ImageDirectory)
	if pathErr != nil {
		log.Errorln(pathErr)
		return pathErr
	}
	filename := filepath.Join(imageDir, time.Now().Format("15-04-05-Mon-Jan-2-2006.png"))
	command := "raspistill -e png " + w.CaptureFlags + " -o " + filename
	parts := strings.Fields(command)
	err := w.runner.Run(parts[0], parts[1:]...)
	if err != nil {
		log.Errorln(err)
		return err
	}
	log.Infoln("Snapshot captured: ", filename)
	latest := filepath.Join(imageDir, "latest.png")
	os.Remove(latest)
	if err := os.Symlink(filename, latest); err != nil {
		log.Errorln(err)
		return err
	}
	return nil
}

func (w *Camera) Off() {
	w.quitCh <- struct{}{}
}
