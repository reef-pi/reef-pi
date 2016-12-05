package webui

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"time"
)

const (
	INTERFACE = "wlp3s0"
)

type ControllerInfo struct {
	IP   string `json:"ip"`
	Time string `json:"time"`
}

func (h *APIHandler) Info(w http.ResponseWriter, r *http.Request) {
	info := ControllerInfo{
		Time: time.Now().Format("Mon Jan 2 15:04:05"),
		IP:   getIP(),
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(&info); err != nil {
		log.Println("ERROR:", err)
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
	}
}

func getIP() string {
	iface, err := net.InterfaceByName(INTERFACE)
	if err != nil {
		log.Fatal(err)
	}
	addrs, err := iface.Addrs()
	if err != nil {
		log.Fatal(err)
	}
	for _, v := range addrs {
		switch s := v.(type) {
		case *net.IPNet:
			if s.IP.To4() != nil {
				return s.IP.To4().String()
			}
		}
	}
	return "unknown"
}
