package watchdog

import (
	"net"
	"github.com/coreos/go-systemd/daemon"
	"log"
	"time"
)

type Watchdog interface {
	watch()
}

func watch() {
	interval, err := daemon.SdWatchdogEnabled(false)
	if err != nil || interval == 0 {
		log.Println("Warning: Watchdog not running, Error:", err)
		return
	}
	for {
		address := "127.0.0.1:80"
		conn, err := net.Dial("tcp", address)
		defer conn.Close()
		if err == nil {
			log.Println("INFO: notifiying watchdog")
			daemon.SdNotify(false, daemon.SdNotifyWatchdog)
			//conn.Close()
		} else {
			log.Println("Warning: Failed watchdog health check, Error:", err)
		}
		time.Sleep(interval / 3)
	}
}
