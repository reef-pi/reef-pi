package main

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"log/syslog"
	"os"
	"time"
)

func restoreDb(file string) {
	log.Println("Executing reef-pi db restore command")
	time.Sleep(time.Second)
	l, err := syslog.New(syslog.LOG_WARNING, "reef-pi restore-db")
	if err != nil {
		log.SetOutput(l)
		log.Println("syslog configured successfully")
	} else {
		log.Println("Failed to configure syslog:", err)
	}

	if _, err := utils.Command("/bin/systemctl", "stop", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to stop reef-pi. Error:", err)
		return
	}
	if err := os.Rename(file, file+".old"); err != nil {
		log.Println("Failed to rename existing reef-pi database. Error:", err)
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
