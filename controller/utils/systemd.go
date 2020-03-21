package utils

import (
	"fmt"
	systemd "github.com/coreos/go-systemd/v22/dbus"
	"github.com/coreos/go-systemd/v22/util"
	"github.com/godbus/dbus/v5"
	"strings"
	"time"
)

const (
	_version    = "Version"
	_targetName = "reef-pi-upgrade.service"
)

/*// set 1 mb memory limit
  mb := 1
	memoryLimit := systemd.Property{
		Name:  "MemoryLimit",
		Value: dbus.MakeVariant(uint64(mb * 1024 * 1024)),
	}
	cpuLimit := systemd.Property{
		Name:  "CPUShares",
		Value: dbus.MakeVariant(uint64(resources.CPU)),
	}
	iopsLimit := systemd.Property{
		Name:  "BlkioWeight",
		Value: dbus.MakeVariant(uint64(resources.IOPS)),
	}
*/

func SystemdExecute(command string) error {
	var conn *systemd.Conn
	if !util.IsRunningSystemd() {
		return fmt.Errorf("systemd is not running")
	}
	conn, err := systemd.New()
	if err != nil {
		return err
	}
	defer conn.Close()
	v, err := conn.GetManagerProperty(_version)
	if err != nil {
		return err
	}
	fmt.Println("systemd version:", v)
	if err := start(command, conn); err != nil {
		fmt.Printf("Failed to start transient unit %s. Error: %s\n", _targetName, err)
		return err
	}
	if err := wait(conn); err != nil {
		return err
	}
	return nil
}

func start(command string, conn *systemd.Conn) error {
	statusCh := make(chan string, 1)
	props := []systemd.Property{
		systemd.PropExecStart(strings.Fields(command), false),
		systemd.Property{Name: "DefaultDependencies", Value: dbus.MakeVariant(false)},
	}
	if _, err := conn.StartTransientUnit(_targetName, "replace", props, statusCh); err != nil {
		return err
	}
	done := <-statusCh
	if done != "done" {
		return fmt.Errorf("Failed to enqueue transient unit. Status: %s\n", done)
	}
	fmt.Println("started unit")
	return nil
}

func wait(conn *systemd.Conn) error {
	statusCh, errCh := conn.SubscribeUnits(5 * time.Second)
	for {
		select {
		case units := <-statusCh:
			for k, u := range units {
				if k == _targetName {
					if u == nil {
						fmt.Printf("Unit finished: %s\n", k)
						return nil
					}
					fmt.Printf("State changed for triggered unit: %#v\n", u)
				}
			}
		case err := <-errCh:
			return err
		}
	}
}
