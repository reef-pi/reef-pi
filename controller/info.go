package controller

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Summary struct {
	Name           string `json:"name"`
	IP             string `json:"ip"`
	CurrentTime    string `json:"current_time"`
	Uptime         string `json:"uptime"`
	CPUTemperature string `json:"cpu_temperature"`
	Display        bool   `json:"display"`
	Admin          bool   `json:"admin"`
}

func (c *Controller) ComputeSummary() Summary {
	ip, err := utils.HostIP(c.config.Interface)
	if err != nil {
		log.Println("ERROR: Failed to detect ip for interface '"+c.config.Interface+". Error:", err)
		ip = "unknown"
	}
	temp, err := utils.CPUTemperature()
	if err != nil {
		log.Println("ERROR:Failed to get controller temperature. Error:", err)
		temp = "unknown"
	}
	s := Summary{
		Name:           c.config.Name,
		CurrentTime:    time.Now().Format("Mon Jan 2 15:04:05"),
		IP:             ip,
		Uptime:         c.Uptime(),
		CPUTemperature: string(temp),
		Display:        c.config.Display,
	}
	return s
}
