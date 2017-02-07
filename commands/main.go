package main

import (
	"flag"
	"fmt"
	"github.com/ranjib/reef-pi/api"
	"github.com/ranjib/reef-pi/controller"
	"log"
	"os"
	"os/signal"
	"strings"
)

var Version string

func main() {
	configFile := flag.String("config", "", "Reef Pi configuration file path")
	version := flag.Bool("version", false, "Print version information")
	flag.Usage = func() {
		text := `
    Usage: reef-pi [OPTIONS]

    Options:

      -config string
          Configuration file path
      -version
			    Print version information
    `
		fmt.Println(strings.TrimSpace(text))
	}
	flag.Parse()
	if *version {
		fmt.Println(Version)
		return
	}
	config := &DefaultConfig
	if *configFile != "" {
		conf, err := ParseConfig(*configFile)
		if err != nil {
			log.Fatal("Failed to parse config file", err)
		}
		config = conf
	}
	c, err := controller.New(config.Controller)
	if err != nil {
		log.Fatal("Failed to initialize controller. ERROR:", err)
	}
	if err := c.Start(); err != nil {
		log.Fatal(err)
	}
	if err := api.SetupServer(config.API, c); err != nil {
		log.Fatal("ERROR:", err)
	}
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt)
	for {
		select {
		case <-ch:
			c.Stop()
			return
		}
	}
}
