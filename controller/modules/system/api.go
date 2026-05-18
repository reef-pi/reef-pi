package system

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/pprof"
	"os"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

type InstallReq struct {
	Version string `json:"version"`
}

func (c *Controller) LoadAPI(r chi.Router) {
	r.Post("/api/display/on", c.EnableDisplay)
	r.Post("/api/display/off", c.DisableDisplay)
	r.Post("/api/display", c.SetBrightness)
	r.Get("/api/display", c.GetDisplayState)
	r.Post("/api/admin/poweroff", c.Poweroff)
	r.Post("/api/admin/reboot", c.Reboot)
	r.Post("/api/admin/reload", c.reload)
	r.Post("/api/admin/upgrade", c.upgrade)
	r.Get("/api/admin/reef-pi.db", c.dbExport)
	r.Post("/api/admin/reef-pi.db", c.dbImport)
	r.Get("/api/info", c.GetSummary)
	if c.config.Pprof {
		c.enablePprof(r)
	}
}

func (c *Controller) enablePprof(r chi.Router) {
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
		devMode := c.config.DevMode
		go func() {
			// Delay so the HTTP response is sent before the shutdown sequence
			// begins. systemd will then send SIGTERM to reef-pi, giving it time
			// to flush and close the database cleanly before the power-off.
			time.Sleep(2 * time.Second)
			if out, err := utils.Command("/bin/systemctl", "poweroff").WithDevMode(devMode).CombinedOutput(); err != nil {
				log.Println("ERROR: Failed to power off reef-pi. Output:", string(out), "Error:", err)
			}
		}()
		return "shutting down", nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) Reboot(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Rebooting reef-pi controller")
		devMode := c.config.DevMode
		go func() {
			// Delay so the HTTP response is sent before the reboot sequence
			// begins. systemd will then send SIGTERM to reef-pi, giving it time
			// to flush and close the database cleanly before the reboot.
			time.Sleep(2 * time.Second)
			if out, err := utils.Command("/bin/systemctl", "reboot").WithDevMode(devMode).CombinedOutput(); err != nil {
				log.Println("ERROR: Failed to reboot reef-pi. Output:", string(out), "Error:", err)
			}
		}()
		return "rebooting", nil
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) reload(w http.ResponseWriter, r *http.Request) {
	fn := func(string) (interface{}, error) {
		log.Println("Reloading reef-pi controller")
		out, err := utils.Command("/bin/systemctl", "restart", "reef-pi.service").WithDevMode(c.config.DevMode).CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("failed to reload reef-pi. Output: %s. Error: %w", string(out), err)
		}
		return out, nil
	}
	utils.JSONGetResponse(fn, w, r)
}
func (c *Controller) upgrade(w http.ResponseWriter, r *http.Request) {
	var v InstallReq
	fn := func(string) error {
		log.Println("Upgrading reef-pi controller to version:", v.Version)
		return utils.SystemdExecute("reef-pi-install.service", "/usr/bin/reef-pi install -version "+v.Version, false)
	}
	utils.JSONUpdateResponse(&v, fn, w, r)
}

func (c *Controller) dbImport(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	fi, _, err := r.FormFile("dbImport")
	if err != nil {
		log.Println("ERROR: Failed to import database file:", err)
		return
	}
	defer fi.Close()
	fo, fErr := os.Create(c.c.Store().Path() + ".new")
	if fErr != nil {
		log.Println("ERROR: Failed to create new database file:", fErr)
		return
	}
	if _, err := io.Copy(fo, fi); err != nil {
		log.Println("ERROR: Failed to copy new database file:", err)
		return
	}

	if _, err := io.Copy(fo, fi); err != nil {
		log.Println("ERROR: Failed to copy new database file:", err)
		return
	}
	if err := utils.SystemdExecute("reef-pi-restore-db.service", "/usr/bin/reef-pi restore-db", true); err != nil {
		log.Println("ERROR: Failed to invoke `reef-pi restore-db`. Details:", err)
		return
	}

}
func (c *Controller) dbExport(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, c.c.Store().Path())
}
