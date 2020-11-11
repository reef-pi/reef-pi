package main

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"os"
	"time"
)

func restoreDb(file string) {
	fmt.Println("Executing reef-pi db restore command")
	time.Sleep(time.Second)
	if _, err := utils.Command("/usr/bin/systemctl stop reef-pi.service").CombinedOutput(); err != nil {
		fmt.Println("Failed to stop reef-pi. Error:", err)
		return
	}
	if err := os.Rename(file, file+".old"); err != nil {
		fmt.Println("Failed to rename existing reef-pi database. Error:", err)
		return
	}
	if err := os.Rename(file, file+".old"); err != nil {
		fmt.Println("Failed to rename new reef-pi database. Error:", err)
		return
	}
	if _, err := utils.Command("/usr/bin/systemctl start eef-pi.service").CombinedOutput(); err != nil {
		fmt.Println("Failed to start reef-pi. Error:", err)
		return
	}
	fmt.Println("Reef-pi db restore command execution finished")
	return
}
