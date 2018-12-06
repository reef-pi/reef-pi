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

	version := flag.Bool("version", false, "Print version information")
	flag.Usage = func() {
		text := `
    Usage: reef-pi [command] [OPTIONS]

    valid commands: daemon, reset-password
    Options:
      -version
          Print version information


    daemon: Run reef-pi controller
    Options:
      -config string
          Configuration file path
    Example: reef-pi daemon -config /etc/reef-pi/reef-pi.yml

    reset-password: Reset reef-pi web ui username and password
    Options:
      -user string
          New username
      -password
          New password
      -config string
          Configuration file path
    Example: reef-pi reset-password -user foo -password bar  -config /etc/reef-pi/reef-pi.yml

    `
		fmt.Println(strings.TrimSpace(text))
	}
	flag.Parse()
	if *version {
		fmt.Println(Version)
		return
	}
	var v string
	args := []string{}
	if len(os.Args) > 1 {
		v = os.Args[1]
	}
	if len(os.Args) > 2 {
		args = os.Args[2:]
	}
	switch v {
	case "reset-password":
		cmd := flag.NewFlagSet("reset-password", flag.ExitOnError)
		user := cmd.String("user", "", "New reef-pi web ui username")
		password := cmd.String("password", "", "New reef-pi web ui password")
		configFile := cmd.String("config", "", "reef-pi configuration file path")
		cmd.Parse(args)
		config := loadConfig(*configFile)
		resetPassword(config.Database, *user, *password)
	case "", "daemon":
		cmd := flag.NewFlagSet("daemon", flag.ExitOnError)
		configFile := cmd.String("config", "", "reef-pi configuration file path")
		cmd.Parse(args)
		config := loadConfig(*configFile)
		daemonize(config.Database)
	default:
		fmt.Println("Unknown command: '", v, "'")
		os.Exit(1)
	}
}

func loadConfig(file string) controller.Config {
	config := controller.DefaultConfig
	if file != "" {
		conf, err := controller.ParseConfig(file)
		if err != nil {
			fmt.Println("Failed to parse config file", err)
			os.Exit(1)
		}
		config = conf
	}
	return config
}
