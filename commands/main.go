package main

import (
	"flag"
	"fmt"
	"github.com/ranjib/reefer/controller"
	"github.com/ranjib/reefer/webui"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
)

func ParseConfig(filename string) (*webui.ServerConfig, error) {
	var c webui.ServerConfig
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		return nil, err
	}
	return &c, nil
}

var Version string

func main() {
	configFile := flag.String("config", "", "Reefer config file path")
	port := flag.Int("port", 8080, "Network port to bind to")
	noAuth := flag.Bool("no-auth", false, "Disable authentication")
	version := flag.Bool("version", false, "Print version information")
	pwm := flag.Bool("pwm", false, "Enable pulse width modulation using PCA9645")
	adc := flag.Bool("adc", false, "Enable Analog to digital converter using mcp3008")
	high := flag.Bool("high", false, "Assume a high relay")
	flag.Usage = func() {
		text := `
    Usage: reefer [OPTIONS]

    Options:

      -config string
          Config file path
      -port  int
          Reefer listening port
      -no-auth
          Disable Google OAuth
      -pwm
          Enable pwm support
      -adc
          Enable adc support
      -version
          Print version information
      -high
          Relay if off in GPIO high state
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
	var config webui.ServerConfig
	if *configFile != "" {
		conf, err := ParseConfig(*configFile)
		if err != nil {
			log.Fatal("Failed to parse config file", err)
		}
		config = *conf
	}
	c, err := controller.New(*pwm, *adc, *high)
	if err != nil {
		log.Fatal("Failed to initialize controller. ERROR:", err)
	}
	if err := c.Start(); err != nil {
		log.Fatal(err)
	}
	if err := webui.SetupServer(config, c, !*noAuth); err != nil {
		log.Fatal("ERROR:", err)
	}
	addr := fmt.Sprintf(":%d", *port)
	log.Printf("Starting http server at: %s\n", addr)
	go http.ListenAndServe(addr, nil)
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
