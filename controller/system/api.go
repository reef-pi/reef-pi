package system

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/display/on", c.EnableDisplay).Methods("POST")
	r.HandleFunc("/api/display/off", c.DisableDisplay).Methods("POST")
	r.HandleFunc("/api/display", c.SetBrightness).Methods("POST")
	r.HandleFunc("/api/display", c.GetDisplayState).Methods("GET")
	r.HandleFunc("/api/admin/poweroff", c.Poweroff).Methods("POST")
	r.HandleFunc("/api/admin/reboot", c.Reboot).Methods("POST")
	r.HandleFunc("/api/admin/reload", c.reload).Methods("POST")
	r.HandleFunc("/api/info", c.GetSummary).Methods("GET")
}

func (c *Controller) EnableDisplay(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) error {
		return c.enableDisplay()
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) DisableDisplay(w http.ResponseWriter, r *http.Request) {
	fn := func(_ string) error {
		return c.disableDisplay()
	}
	utils.JSONDeleteResponse(fn, w, r)
}

func (c *Controller) SetBrightness(w http.ResponseWriter, r *http.Request) {
	var conf DisplayConfig
	fn := func() error {
		return c.setBrightness(conf.Brightness)
	}
	utils.JSONCreateResponse(&conf, fn, w, r)
}

func (c *Controller) GetDisplayState(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		if !c.config.Display {
			return DisplayState{}, nil
		}
		return c.currentDisplayState()
	}
	utils.JSONGetResponse(fn, w, r)
}
func (t *Controller) GetSummary(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return t.ComputeSummary(), nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) Poweroff(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Shutting down reef-pi controller")
		out, err := utils.Command("/bin/systemctl", "poweroff").WithDevMode(c.config.DevMode).CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Failed to power off reef-pi. Output:" + string(out) + ". Error: " + err.Error())
		}
		return out, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) Reboot(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Rebooting reef-pi controller")
		out, err := utils.Command("/bin/systemctl", "reboot").WithDevMode(c.config.DevMode).CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Failed to reboot reef-pi. Output:" + string(out) + ". Error: " + err.Error())
		}
		return out, nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) reload(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Reloading reef-pi controller")
		out, err := utils.Command("/bin/systemctl", "restart", "reef-pi.service").WithDevMode(c.config.DevMode).CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Failed to reload reef-pi. Output:" + string(out) + ". Error: " + err.Error())
		}
		return out, nil
	}
	utils.JSONGetResponse(fn, w, r)
}
