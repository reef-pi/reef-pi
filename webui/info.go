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

type ControllerInfo struct {
	IP          string `json:"ip"`
	Time        string `json:"time"`
	StartTime   string `json:"start_time"`
	Temperature string `json:"temperature"`
}

func (h *APIHandler) GetDisplay(w http.ResponseWriter, r *http.Request) {
	var state bool
	if h.DSIDisplay {
		d, err := ioutil.ReadFile("/sys/class/backlight/rpi_backlight/bl_power")
		if err != nil {
			errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
			return
		}
		state = string(d) == "0"
	} else {
		out, err := exec.Command("vcgencmd", "display_power").CombinedOutput()
		if err != nil {
			errorResponse(http.StatusInternalServerError, "Failed to get controller temperature. Error: "+err.Error(), w)
			return
		}
		stateStr := strings.Split(string(out), "=")[1]
		state = stateStr == "1"
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	payload := map[string]bool{"on": state}
	if err := encoder.Encode(&payload); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) EnableDisplay(w http.ResponseWriter, r *http.Request) {
	if h.DSIDisplay {
		if err := ioutil.WriteFile("/sys/class/backlight/rpi_backlight/bl_power", []byte("0"), 0644); err != nil {
			errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
			return
		}
	} else {
		if err := exec.Command("vcgencmd", "display_power", "1").Run(); err != nil {
			errorResponse(http.StatusInternalServerError, "Failed to enable display. Error: "+err.Error(), w)
			return
		}
	}
	log.Println("Display enabled")
}

func (h *APIHandler) DisableDisplay(w http.ResponseWriter, r *http.Request) {
	if h.DSIDisplay {
		if err := ioutil.WriteFile("/sys/class/backlight/rpi_backlight/bl_power", []byte("1"), 0644); err != nil {
			errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
			return
		}
	} else {
		if err := exec.Command("vcgencmd", "display_power", "0").Run(); err != nil {
			log.Println("ERROR: Failed to disable display:", err)
			errorResponse(http.StatusInternalServerError, "Failed to disable display. Error: "+err.Error(), w)
			return
		}
	}
	log.Println("Display disabled")
}

func (h *APIHandler) Info(w http.ResponseWriter, r *http.Request) {
	ip, err := getIP(h.Interface)
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to detect ip for interface '"+h.Interface+"'. Error: "+err.Error(), w)
		return
	}
	temp, err := getTemperature()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to get controller temperature. Error: "+err.Error(), w)
		return
	}
	info := ControllerInfo{
		Time:        time.Now().Format("Mon Jan 2 15:04:05"),
		IP:          ip,
		StartTime:   h.controller.StartTime(),
		Temperature: string(temp),
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

func getTemperature() (string, error) {
	out, err := exec.Command("vcgencmd", "measure_temp").CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.Split(string(out), "=")[1], nil
}
