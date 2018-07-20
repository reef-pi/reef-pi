package main

import (
	"flag"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	"os"
	"strings"
)

var Version string

func main() {
	configFile := flag.String("config", "", "reef-pi configuration file path")
	user := flag.String("user", "", "New reef-pi web ui username")
	password := flag.String("password", "", "New reef-pi web ui password")
	version := flag.Bool("version", false, "Print version information")
	flag.Usage = func() {
		text := `
    Usage: reef-pi [command] [OPTIONS]

    valid commands: daemon, reset-password
    Options:
      -config string
          Configuration file path
      -version
          Print version information


    daemon: Run reef-pi controller
    Example: reef-pi daemon -config /etc/reef-pi/reef-pi.yml

    reset-password: Reset reef-pi web ui username and password
    Options:
      -user string
          New username
      -password
          New password
    Example: reef-pi -user foo -password bar  -config /etc/reef-pi/reef-pi.yml

    `
		fmt.Println(strings.TrimSpace(text))
	}
	flag.Parse()
	if *version {
		fmt.Println(Version)
		return
	}
	var v string
	if len(os.Args) > 1 {
		v = os.Args[1]
	}
	config := controller.DefaultConfig
	if *configFile != "" {
		conf, err := controller.ParseConfig(*configFile)
		if err != nil {
			fmt.Println("Failed to parse config file", err)
			os.Exit(1)
		}
		config = conf
	}
	switch v {
	case "reset-password":
		resetPassword(config.Database, *user, *password)
	case "", "daemon":
		daemonize(config.Database)
	default:
		fmt.Println("Unknown command:", os.Args[0])
		os.Exit(1)
	}
}
