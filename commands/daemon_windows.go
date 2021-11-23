//go:build windows
// +build windows

package main

import (
	"log"

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

	//keep alive until process is killed.
	select {}
}
