package main

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"os"
	"time"
)

/*
reef-pi restore-db command is used to import existing reef-pi database.
api/admin/reef-pi.db POST handler receives the database as form payload,
saves it as new database (nPath), and invokes reef-pi restore-db command
asynchronously via systemd.
 - Stop reef-pi service
 - Backup current db file(cPath) as user provided old db file (oPath)
 - Move/Rename user provided new db file (nPath) as current db file (cPath)
 - Start reef-pi service
*/

func restoreDb(cPath, oPath, nPath string) { // current, old and new db file path
	log.Println("Executing reef-pi db restore command")
	time.Sleep(time.Second)
	if _, err := utils.Command("/bin/systemctl", "stop", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to stop reef-pi:", err)
		return
	}
	log.Println("Stopped reef-pi service")
	time.Sleep(time.Second)
	if err := os.Rename(cPath, oPath); err != nil {
		log.Println("Failed to rename existing reef-pi database:", err)
	} else {
		log.Println("Existing database:", cPath, " is backed up at:", oPath)
	}
	if err := os.Rename(nPath, cPath); err != nil {
		log.Println("Failed to rename new reef-pi database:", err)
		return
	}
	log.Println("New database:", nPath, "  moved as:", oPath)
	if _, err := utils.Command("/bin/systemctl", "start", "reef-pi.service").CombinedOutput(); err != nil {
		log.Println("Failed to start reef-pi:", err)
		return
	}
	log.Println("reef-pi db restore is done")
	return
}
