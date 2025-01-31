package system

import (
	"io/ioutil"
	"log"
	"net"
	"strings"
	"time"

	"github.com/shirou/gopsutil/v4/host"

	"github.com/reef-pi/reef-pi/controller/utils"
)

const (
	_modelFilePath = "/proc/device-tree/model"
)

//swagger:model systemSummary
type Summary struct {
	Name           string `json:"name"`
	IP             string `json:"ip"`
	CurrentTime    string `json:"current_time"`
	Uptime         string `json:"uptime"`
	CPUTemperature string `json:"cpu_temperature"`
	Version        string `json:"version"`
	Model          string `json:"model"`
}

func (c *Controller) ComputeSummary() Summary {
	s := Summary{
		Name:        c.config.Name,
		CurrentTime: time.Now().Format("Mon Jan 2 15:04:05, 2006"),
		IP:          c.ip,
		Uptime:      c.Uptime(),
		Version:     c.config.Version,
		Model:       c.model,
	}
	if c.isRaspberryPi {
		temp, err := c.CPUTemperature()
		if err != nil {
			log.Println("ERROR:Failed to get controller temperature. Error:", err)
			temp = "unknown"
		}
		s.CPUTemperature = temp
	}
	return s
}

const _unknwonIface = "unknown"

func HostIP(i string) string {
	iface, err := net.InterfaceByName(i)
	if err != nil {
		log.Println("WARN: Failed to obatin interface details: "+i+". Error:", err)
		return _unknwonIface
	}
	addrs, err := iface.Addrs()
	if err != nil {
		log.Println("WARN: Failed to fetch address for interface: "+i+". Error:", err)
		return _unknwonIface
	}
	for _, v := range addrs {
		switch s := v.(type) {
		case *net.IPNet:
			if s.IP.To4() != nil {
				return s.IP.To4().String()
			}
		}
	}
	log.Println("WARN: interface " + i + " has no associated ip")
	return _unknwonIface
}

// temp=36.9'C
func (c *Controller) CPUTemperature() (string, error) {
	out, err := utils.Command("vcgencmd", "measure_temp").WithDevMode(c.config.DevMode).CombinedOutput()
	if err != nil {
		return "", err
	}
	if c.config.DevMode {
		out = []byte("foo=23.23 ")
	}
	return strings.Split(string(out), "=")[1], nil
}

func GetModel() string {
	stats, err := host.Info()
	if err == nil && !strings.HasPrefix(stats.KernelArch, "arm") {
		return stats.Platform + ", " + stats.PlatformVersion + "(" + stats.KernelArch + ")"
	}
	data, err := ioutil.ReadFile("/proc/device-tree/model")
	if err != nil {
		log.Println("Failed to detect Raspberry Pi version. Error:", err)
		return "unknown"
	}
	return strings.TrimSpace(string(data))
}
