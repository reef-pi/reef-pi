package webui

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os/exec"
	"strings"
	"time"
)

type ControllerSummary struct {
	IP             string `json:"ip"`
	CurrentTime    string `json:"current_time"`
	Uptime         string `json:"uptime"`
	CPUTemperature string `json:"cpu_temperature"`
}

type Info struct {
	ControllerSummary   ControllerSummary `json:"system"`
	TemperatureReadings []int             `json:"temperature_readings"`
}

func (h *APIHandler) Info(w http.ResponseWriter, r *http.Request) {
	ip, err := getIP(h.Interface)
	if err != nil {
		log.Println("ERROR: Failed to detect ip for interface '"+h.Interface+". Error:", err)
	}
	temp, err := getCPUTemperature()
	if err != nil {
		log.Println("ERROR:Failed to get controller temperature. Error:", err)
	}
	summary := ControllerSummary{
		CurrentTime:    time.Now().Format("Mon Jan 2 15:04:05"),
		IP:             ip,
		Uptime:         h.controller.Uptime(),
		CPUTemperature: string(temp),
	}
	temperatureReadings := h.controller.GetTemperature()
	info := Info{
		ControllerSummary:   summary,
		TemperatureReadings: temperatureReadings,
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(&info); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
		return
	}
}

func getIP(i string) (string, error) {
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

func getCPUTemperature() (string, error) {
	out, err := exec.Command("vcgencmd", "measure_temp").CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.Split(string(out), "=")[1], nil
}
