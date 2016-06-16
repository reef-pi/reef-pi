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
	logLevel := flag.String("log", "info", "Logging level")
	flag.Parse()
	setupLogger(*logLevel)
	conf, err := reefer.ParseConfig(*configFile)
	if err != nil {
		log.Warnln("Failed to pasrse oauth config")
		log.Fatal(err)
	}
	controller := modules.NewBC29Controller(conf.ReturnPump, conf.RecirculationPump)
	if conf.Camera.On {
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
	web := &webui.Server{
		Domain:           conf.Auth.Domain,
		Users:            conf.Auth.Users,
		OauthID:          conf.Auth.ID,
		OauthCallbackUrl: conf.Auth.CallbackUrl,
		GomniAuthSecret:  conf.Auth.GomniAuthSecret,
		OauthSecret:      conf.Auth.Secret,
		ImageDirectory:   conf.Camera.ImageDirectory,
	}
	web.Setup()
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
