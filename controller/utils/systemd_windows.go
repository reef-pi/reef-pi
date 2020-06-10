// +build windows, !test

package utils

import "fmt"

func SystemdExecute(command string) error {
	fmt.Printf("Systemd commands not supported on Windows.\n")
	return nil
}
