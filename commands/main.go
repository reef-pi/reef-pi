package main

import (
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/reef-pi/reef-pi/controller/daemon"
)

var Version string

var (
	runDaemonize     = daemonize
	runResetPassword = resetPassword
	runRestoreDb     = restoreDb
	runInstall       = install
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func run(argv []string) error {
	flags := flag.NewFlagSet("reef-pi", flag.ContinueOnError)
	version := flags.Bool("version", false, "Print version information")
	flags.Usage = func() {
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
	if err := flags.Parse(argv); err != nil {
		return err
	}
	if *version {
		fmt.Println(Version)
		return nil
	}
	var v string
	args := []string{}
	parsedArgs := flags.Args()
	if len(parsedArgs) > 0 {
		v = parsedArgs[0]
	}
	if len(parsedArgs) > 1 {
		args = parsedArgs[1:]
	}
	switch v {
	case "db":
		cmd, err := NewDBCmd(args)
		if err != nil {
			return fmt.Errorf("Failed to parse command line flags. Error: %w", err)
		}
		defer cmd.Close()
		if err := cmd.Execute(); err != nil {
			return fmt.Errorf("Failed due to error: %w", err)
		}
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
		config, err := loadConfig(*configFile)
		if err != nil {
			return fmt.Errorf("Failed to load config file. Error: %w", err)
		}
		runResetPassword(config.Database, *user, *password)
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
		runRestoreDb(*cPath, *oPath, *nPath)
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
		if err := runInstall(*version); err != nil {
			return fmt.Errorf("reef-pi installed failed. Error: %w", err)
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
		config, err := loadConfig(*configFile)
		if err != nil {
			return fmt.Errorf("Failed to load config file. Error: %w", err)
		}
		runDaemonize(config.Database)
	default:
		return fmt.Errorf("Unknown command: '%s'", v)
	}
	return nil
}

func loadConfig(file string) (daemon.Config, error) {
	if file == "" {
		return daemon.DefaultConfig, nil
	}
	return daemon.ParseConfig(file)
}
