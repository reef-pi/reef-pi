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
	controller := &modules.NullController{}
	camera := modules.NewCamera(controller, conf.ImageDirectory, time.Duration(conf.TickInterval))

	if conf.CaptureFlags != "" {
		camera.CaptureFlags = conf.CaptureFlags
	}
	go camera.On()
	defer camera.Off()
	web := &webui.Server{
		AuthDomain:       conf.AuthDomain,
		Users:            conf.Users,
		OauthID:          conf.ID,
		OauthCallbackUrl: conf.CallbackUrl,
		GomniAuthSecret:  conf.GomniauthSecret,
		OauthSecret:      conf.Secret,
		ImageDirectory:   conf.ImageDirectory,
	}
	web.Setup()
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
