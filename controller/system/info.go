package system

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net"
	"strings"
	"time"
)

type Summary struct {
	Name           string `json:"name"`
	IP             string `json:"ip"`
	CurrentTime    string `json:"current_time"`
	Uptime         string `json:"uptime"`
	CPUTemperature string `json:"cpu_temperature"`
	Version        string `json:"version"`
}

func (c *Controller) ComputeSummary() Summary {
	ip, err := c.HostIP(c.config.Interface)
	if err != nil {
		log.Println("ERROR: Failed to detect ip for interface '"+c.config.Interface+". Error:", err)
		ip = "unknown"
	}
	temp, err := c.CPUTemperature()
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
		Version:        c.config.Version,
	}
	return s
}

func (c *Controller) HostIP(i string) (string, error) {
	iface, err := net.InterfaceByName(i)
	if err != nil {
		return "", err
	}
	addrs, err := iface.Addrs()
	if err != nil {
		return "", err
	}
	for _, v := range addrs {
		switch s := v.(type) {
		case *net.IPNet:
			if s.IP.To4() != nil {
				return s.IP.To4().String(), nil
			}
		}
	}
	return "", fmt.Errorf("Cant detect IP of interface:%s", i)
}

// temp=36.9'C
func (c *Controller) CPUTemperature() (string, error) {
	if c.config.DevMode {
		return "36.9C", nil
	}
	out, err := utils.Command("vcgencmd", "measure_temp").WithDevMode(c.config.DevMode).CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.Split(string(out), "=")[1], nil
}
