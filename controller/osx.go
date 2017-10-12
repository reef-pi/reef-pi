// +build !linux

package controller

import (
	"log"
)

func (h *HealthChecker) check() {
	log.Println("OSX check is not implemented")
}
