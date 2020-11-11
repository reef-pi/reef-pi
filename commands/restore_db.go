package main

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"os"
	"time"
)

func restoreDb(file string) {
	log.Println("Executing reef-pi db restore command")
	time.Sleep(time.Second)
	if _, err := utils.Command("/bin/systemctl", "stop", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to stop reef-pi. Error:", err)
		return
	}
	log.Println("Stopped reef-pi service")
	time.Sleep(time.Second)
	if err := os.Rename(file, file+".old"); err != nil {
		log.Println("Failed to rename existing reef-pi database. Error:", err)
	} else {
		log.Println("Existing database is copied with .old prefix")
	}
	if err := os.Rename(file+".new", file); err != nil {
		log.Println("Failed to rename new reef-pi database. Error:", err)
		return
	}
	if _, err := utils.Command("/bin/systemctl", "start", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to start reef-pi. Error:", err)
		return
	}
	log.Println("Reef-pi db restore command execution finished")
	return
}
