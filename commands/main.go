package main

import (
	"flag"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
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
	config := controller.DefaultConfig
	if *configFile != "" {
		conf, err := controller.ParseConfig(*configFile)
		if err != nil {
			log.Fatal("Failed to parse config file", err)
		}
		config = conf
	}
	c, err := controller.New(Version, config.Database)
	if err != nil {
		log.Fatal("ERROR: Failed to initialize controller. Error:", err)
	}
	if err := c.Start(); err != nil {
		log.Println("ERROR: Failed to start controller. Error:", err)
	}
	if err := c.API(); err != nil {
		log.Println("ERROR: Failed to start API server. Error:", err)
	}

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt, syscall.SIGUSR2, syscall.SIGTERM)
	for {
		select {
		case s := <-ch:
			switch s {
			case syscall.SIGTERM:
				c.Stop()
				return
			case os.Interrupt:
				c.Stop()
				return
			case syscall.SIGUSR2:
			}
		}
	}
}
