package main

import (
	"flag"
	"fmt"
	"github.com/ranjib/reefer/controller"
	"github.com/ranjib/reefer/webui"
	"log"
	"net/http"
	"os"
	"os/signal"
)

func main() {
	configFile := flag.String("config", "", "Reefer config file path")
	port := flag.Int("port", 8080, "Network port to bind to")
	noAuth := flag.Bool("no-auth", false, "Disable authentication")
	flag.Parse()
	config := DefaultConfig()
	if *configFile != "" {
		conf, err := ParseConfig(*configFile)
		if err != nil {
			log.Fatal("Failed to parse config file", err)
		}
		config = *conf
	}
	controller := controller.NewRaspi(&config.PinLayout)
	if err := controller.Start(); err != nil {
		log.Fatal(err)
	}
	defer controller.Stop()

	webui.SetupServer(config.Server, controller, !*noAuth, config.Camera.ImageDirectory)
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("Starting http server at: %s\n", addr)
	go http.ListenAndServe(addr, nil)
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	for {
		select {
		case <-c:
			controller.Stop()
			return
		}
	}
}
