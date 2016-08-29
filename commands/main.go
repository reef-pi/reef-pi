package main

import (
	"flag"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/ranjib/reefer"
	"github.com/ranjib/reefer/controller"
	"github.com/ranjib/reefer/webui"
	"net/http"
)

func main() {
	configFile := flag.String("config", "", "Reefer config file path")
	port := flag.Int("port", 8080, "Network port to bind to")
	noAuth := flag.Bool("no-auth", false, "Disable authentication")
	logLevel := flag.String("log", "info", "Logging level")
	flag.Parse()
	setupLogger(*logLevel)
	config := reefer.DefaultConfig()
	if *configFile != "" {
		conf, err := reefer.ParseConfig(*configFile)
		if err != nil {
			log.Warnln("Failed to pasrse oauth config")
			log.Fatal(err)
		}
		config = *conf
	}
	controller := controller.NewRaspi(&config.PinLayout)
	webui.SetupServer(config.Server, controller, !*noAuth, config.Camera.ImageDirectory)
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
