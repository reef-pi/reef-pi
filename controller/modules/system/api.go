package system

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/pprof"
	"os"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {

	// swagger:route POST /api/display/on Display systemDisplayOn
	// Turn display on.
	// Turn display on.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/display/on", c.EnableDisplay).Methods("POST")

	// swagger:route POST /api/display/off Display systemDisplayOff
	// Turn display off.
	// Turn display off.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/display/off", c.DisableDisplay).Methods("POST")

	// swagger:operation POST /api/display Display systemDisplayPost
	// Set display brigthness
	// Set display brightness
	// ---
	// parameters:
	//  - in: body
	//    name: displayconfig
	//    required: true
	//    schema:
	//     $ref: '#/definitions/displayConfig'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/display", c.SetBrightness).Methods("POST")

	// swagger:route GET /api/display Display systemDisplayGet
	// Get current display state.
	// Get current display state.
	// responses:
	//  200: displayState
	r.HandleFunc("/api/display", c.GetDisplayState).Methods("GET")

	// swagger:route POST /api/admin/poweroff Admin adminPowerOff
	// Shut down the raspberry pi.
	// Shut down the raspberry pi.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/poweroff", c.Poweroff).Methods("POST")

	// swagger:route POST /api/admin/reboot Admin adminReboot
	// Reboot the raspberry pi.
	// Reboot the raspberry pi.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/reboot", c.Reboot).Methods("POST")

	// swagger:route POST /api/admin/reload Admin adminReload
	// Reload reef-pi.
	// Reload reef-pi to apply any capability changes or other modules that are registered at startup.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/reload", c.reload).Methods("POST")

	// swagger:route POST /api/admin/upgrade Admin adminUpgrade
	// Upgrade reef-pi.
	// Upgrade reef-pi.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/upgrade", c.upgrade).Methods("POST")

	// swagger:route GET /api/admin/reef-pi.db Admin dbExport
	// Download current reef-pi database.
	// Download current reef-pi database.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/reef-pi.db", c.dbExport).Methods("GET")

	// swagger:route POST /api/admin/reef-pi.db Admin dbImport
	// Import reef-pi database.
	// Import reef-pi database.
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/admin/reef-pi.db", c.dbImport).Methods("POST")

	// swagger:route GET /api/info Admin adminInfo
	// Get system summary.
	// Get system summary.
	// responses:
	//  200: systemSummary
	r.HandleFunc("/api/info", c.GetSummary).Methods("GET")
	if c.config.Pprof {
		c.enablePprof(r)
	}
}

func (c *Controller) enablePprof(r *mux.Router) {
	r.HandleFunc("/debug/pprof/", pprof.Index)
	r.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	r.HandleFunc("/debug/pprof/profile", pprof.Profile)
	r.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	r.HandleFunc("/debug/pprof/trace", pprof.Trace)
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
func (c *Controller) upgrade(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Upgrading reef-pi controller")
		err := utils.SystemdExecute("reef-pi-system-upgrade.service", "/usr/bin/apt-get update -y", false)
		if err != nil {
			return "", fmt.Errorf("Failed to update. Error: " + err.Error())
		}
		return "", nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) dbImport(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	fi, _, err := r.FormFile("dbImport")
	if err != nil {
		log.Println("ERROR: Failed to import database file. Details:", err)
		return
	}
	defer fi.Close()
	fo, fErr := os.Create(c.c.Store().Path() + ".new")
	if fErr != nil {
		log.Println("ERROR: Failed to create new database file. Details:", fErr)
		return
	}
	if _, err := io.Copy(fo, fi); err != nil {
		log.Println("ERROR: Failed to copy new database file. Details:", err)
		return
	}

	if _, err := io.Copy(fo, fi); err != nil {
		log.Println("ERROR: Failed to copy new database file. Details:", err)
		return
	}
	if err := utils.SystemdExecute("reef-pi-restore-db.service", "/usr/bin/reef-pi restore-db -config /etc/reef-pi/config.yaml", true); err != nil {
		log.Println("ERROR: Failed to invoke `reef-pi restore-db`. Details:", err)
		return
	}

}
func (c *Controller) dbExport(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, c.c.Store().Path())
}
