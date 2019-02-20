// +build !windows

package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/reef-pi/manager"
)

func mgr() {
	c, err := manager.New(Version)
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
