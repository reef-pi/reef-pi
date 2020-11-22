package main

import (
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/reef-pi/reef-pi/controller/daemon"
)

var Version string

func main() {

	version := flag.Bool("version", false, "Print version information")
	flag.Usage = func() {
		text := `
    Usage: reef-pi [command] [OPTIONS]

    valid commands: daemon, reset-password, db, restore-db

    reset-password: Reset reef-pi web ui username and password
    daemon: Run reef-pi controller
    db: Interact with reef-pi database
    restore-db: Restore and imported database
    install: Install another reef-pi version

    Options:
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
	var v string
	args := []string{}
	if len(os.Args) > 1 {
		v = os.Args[1]
	}
	if len(os.Args) > 2 {
		args = os.Args[2:]
	}
	switch v {
	case "db":
		cmd, err := NewDBCmd(args)
		if err != nil {
			fmt.Println("Failed to parse command line flags. Error:", err)
			os.Exit(1)
		}
		if err := cmd.Execute(); err != nil {
			fmt.Println("Failed due to error:", err)
			os.Exit(1)
		}
		defer cmd.Close()
	case "reset-password":
		cmd := flag.NewFlagSet("reset-password", flag.ExitOnError)
		user := cmd.String("user", "", "New reef-pi web ui username")
		password := cmd.String("password", "", "New reef-pi web ui password")
		configFile := cmd.String("config", "", "reef-pi configuration file path")
		cmd.Usage = func() {
			text := `
    reset-password: Reset reef-pi web ui username and password
    Example: reef-pi reset-password -user foo -password bar  -config /etc/reef-pi/reef-pi.yml
    `
			fmt.Println(strings.TrimSpace(text))
			fmt.Println("\nOptions:")
			cmd.PrintDefaults()
		}
		cmd.Parse(args)
		config := loadConfig(*configFile)
		resetPassword(config.Database, *user, *password)
	case "restore-db":
		cmd := flag.NewFlagSet("restore-db", flag.ExitOnError)
		cPath := cmd.String("current", "/var/lib/reef-pi/reef-pi.db", "Current database file path")
		oPath := cmd.String("backup", "/var/lib/reef-pi/reef-pi.db.old", "Backup database file path")
		nPath := cmd.String("new", "/var/lib/reef-pi/reef-pi.db.new", "New database file path")
		cmd.Usage = func() {
			text := `
    restore-db: Restore and imported database
    Example: reef-pi restore-db
    `
			fmt.Println(strings.TrimSpace(text))
			fmt.Println("\nOptions:")
			cmd.PrintDefaults()
		}
		cmd.Parse(args)
		restoreDb(*cPath, *oPath, *nPath)
	case "install":
		cmd := flag.NewFlagSet("install", flag.ExitOnError)
		version := cmd.String("version", "", "Version to be installed")
		cmd.Usage = func() {
			text := `
    install: install a reef-pi version
    Example: reef-pi install -version 4.0
    `
			fmt.Println(strings.TrimSpace(text))
			fmt.Println("\nOptions:")
			cmd.PrintDefaults()
		}
		cmd.Parse(args)
		if err := install(*version); err != nil {
			fmt.Println("reef-pi installed failed. Error:", err)
			os.Exit(1)
		}
	case "", "daemon":
		cmd := flag.NewFlagSet("daemon", flag.ExitOnError)
		configFile := cmd.String("config", "", "reef-pi configuration file path")
		cmd.Usage = func() {
			text := `
    daemon: Run reef-pi controller
    Example: reef-pi daemon -config /etc/reef-pi/reef-pi.yml

    `
			fmt.Println(strings.TrimSpace(text))
			fmt.Println("\nOptions:")
			cmd.PrintDefaults()
		}
		cmd.Parse(args)
		config := loadConfig(*configFile)
		daemonize(config.Database)
	default:
		fmt.Println("Unknown command: '", v, "'")
		os.Exit(1)
	}
}

func loadConfig(file string) daemon.Config {
	config := daemon.DefaultConfig
	if file != "" {
		conf, err := daemon.ParseConfig(file)
		if err != nil {
			fmt.Println("Failed to parse config file", err)
			os.Exit(1)
		}
		config = conf
	}
	return config
}
