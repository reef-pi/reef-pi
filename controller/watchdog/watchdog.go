package watchdog

import (
	"log"
	"net"
	"time"

	"github.com/coreos/go-systemd/daemon"
)

type wd struct {
	address string
}

type Watchdog interface {
	Start()
}

func (w *wd) Start() {
	interval, err := daemon.SdWatchdogEnabled(false)
	if err != nil || interval == 0 {
		log.Println("Warning: Watchdog not running, Error:", err)
		return
	}
	for {
		daemon.SdNotify(false, daemon.SdNotifyReady)
		conn, err := net.Dial("tcp", w.address)
		if err == nil {
			daemon.SdNotify(false, daemon.SdNotifyWatchdog)
			conn.Close()
		} else {
			log.Println("Warning: Failed watchdog health check, Error:", err)
		}
		time.Sleep(interval / 3)
	}
}

func NewWatchdog(address string) *wd {
        return &wd{
		address,
	}
}
