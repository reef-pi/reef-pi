package api

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os/exec"
	"strings"
)

const (
	DSIDevice = "/sys/class/backlight/rpi_backlight/bl_power"
)

func (h *APIHandler) GetDisplay(w http.ResponseWriter, r *http.Request) {
	var state bool
	if h.DSIDisplay {
		d, err := ioutil.ReadFile(DSIDevice)
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
		if err := ioutil.WriteFile(DSIDevice, []byte("0"), 0644); err != nil {
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
		if err := ioutil.WriteFile(DSIDevice, []byte("1"), 0644); err != nil {
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
