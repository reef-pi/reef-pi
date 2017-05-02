package api

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"
)

const (
	DSIDevice = "/sys/class/backlight/rpi_backlight/bl_power"
)

func (h *APIHandler) GetDisplay(w http.ResponseWriter, r *http.Request) {
	var state bool
	d, err := ioutil.ReadFile(DSIDevice)
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
		return
	}
	state = string(d) == "0"
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	payload := map[string]bool{"on": state}
	if err := encoder.Encode(&payload); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
	}
}

func (h *APIHandler) EnableDisplay(w http.ResponseWriter, r *http.Request) {
	if err := ioutil.WriteFile(DSIDevice, []byte("0"), 0644); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
		return
	}
	log.Println("Display enabled")
}

func (h *APIHandler) DisableDisplay(w http.ResponseWriter, r *http.Request) {
	if err := ioutil.WriteFile(DSIDevice, []byte("1"), 0644); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed enable display. Error: "+err.Error(), w)
		return
	}
	log.Println("Display disabled")
}

type DisplayConfig struct {
	Enable     bool `json:"enable"`
	Brightness int  `json:"brightness"`
}

func (h *APIHandler) SetBrightness(w http.ResponseWriter, r *http.Request) {
	device := "/sys/class/backlight/rpi_backlight/brightness"
	w.Header().Set("Content-Type", "application/json")
	var c DisplayConfig
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
		return
	}
	if err := ioutil.WriteFile(device, []byte(strconv.Itoa(c.Brightness)), 0644); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to set brightness. Error: "+err.Error(), w)
		return
	}
}
