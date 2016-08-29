package main

import (
	log "github.com/Sirupsen/logrus"
	"os"
)

func isTTY() bool {
	stat, _ := os.Stdin.Stat()
	return (stat.Mode() & os.ModeCharDevice) == 0
}

func setupLogger(level string) {
	log.SetFormatter(&log.TextFormatter{
		FullTimestamp: true,
	})
	switch level {
	case "panic":
		log.SetLevel(log.PanicLevel)
	case "fatal":
		log.SetLevel(log.FatalLevel)
	case "error":
		log.SetLevel(log.ErrorLevel)
	case "warn":
		log.SetLevel(log.WarnLevel)
	case "info":
		log.SetLevel(log.InfoLevel)
	case "debug":
		log.SetLevel(log.DebugLevel)
	default:
		log.Fatalf("Unknown log level: %s", level)
	}
}
