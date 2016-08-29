package main

import (
	"flag"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/ranjib/reefer"
	"github.com/ranjib/reefer/modules"
	"github.com/ranjib/reefer/webui"
	"net/http"
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
	controller := modules.NewPiController()
	web := &webui.Server{
		Domain:           conf.Auth.Domain,
		Users:            conf.Auth.Users,
		OauthID:          conf.Auth.ID,
		OauthCallbackUrl: conf.Auth.CallbackUrl,
		GomniAuthSecret:  conf.Auth.GomniAuthSecret,
		OauthSecret:      conf.Auth.Secret,
		ImageDirectory:   conf.Camera.ImageDirectory,
	}
	web.Setup(controller, !*noAuth)
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
