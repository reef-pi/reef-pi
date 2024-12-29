//go:build !windows
// +build !windows

package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/reef-pi/reef-pi/controller/daemon"
)

func daemonize(db string) {
	c, err := daemon.New(Version, db)
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
			log.Println("Received signal:", s)
			switch s {
			case os.Interrupt, syscall.SIGTERM:
				err := c.Stop()
				if err != nil {
					log.Println("ERROR: Failed to stop controller. Error:", err)
				}
				return
			case syscall.SIGUSR2:
			}
		}
	}
}
