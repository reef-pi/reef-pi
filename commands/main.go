package main

import (
	"flag"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/ranjib/reefer"
	"github.com/ranjib/reefer/modules"
	"github.com/ranjib/reefer/webui"
	"net/http"
	"time"
)

func main() {
	configFile := flag.String("config", "reefer.yml", "Reefer config file path")
	port := flag.Int("port", 8080, "Network port to bind to")
	noAuth := flag.Bool("no-auth", false, "Disable authentication")
	logLevel := flag.String("log", "info", "Logging level")
	flag.Parse()
	setupLogger(*logLevel)
	conf, err := reefer.ParseConfig(*configFile)
	if err != nil {
		log.Warnln("Failed to pasrse oauth config")
		log.Fatal(err)
	}
	controller := modules.NewBC29Controller(conf.ReturnPump, conf.PowerHead)
	if conf.Camera.On {
		log.Info("Turning on camera module")
		camera := modules.NewCamera(
			controller,
			conf.Camera.ImageDirectory,
			time.Duration(conf.Camera.TickInterval),
		)

		if conf.Camera.CaptureFlags != "" {
			camera.CaptureFlags = conf.Camera.CaptureFlags
		}
		go camera.On()
		defer camera.Off()
	}

	if conf.WaterLevelSensor.On {
		log.Info("Turning on water level sensor")
		adc := &modules.ADC{
			ChanNum:  conf.WaterLevelSensor.Pin,
			Interval: conf.WaterLevelSensor.Interval,
		}
		go adc.On()
		defer adc.Off()
	}
	if conf.PeristalticPump.On {
		log.Info("Turning on peristaltic pump")
		go conf.PeristalticPump.Start()
	}
	web := &webui.Server{
		Domain:           conf.Auth.Domain,
		Users:            conf.Auth.Users,
		OauthID:          conf.Auth.ID,
		OauthCallbackUrl: conf.Auth.CallbackUrl,
		GomniAuthSecret:  conf.Auth.GomniAuthSecret,
		OauthSecret:      conf.Auth.Secret,
		ImageDirectory:   conf.Camera.ImageDirectory,
	}
	web.Setup(!*noAuth)
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
