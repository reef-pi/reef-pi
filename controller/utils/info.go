package utils

import (
	"fmt"
	"net"
	"os/exec"
	"strings"
)

func HostIP(i string) (string, error) {
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
func CPUTemperature() (string, error) {
	out, err := exec.Command("vcgencmd", "measure_temp").CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.Split(string(out), "=")[1], nil
}
