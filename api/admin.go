package api

import (
	"net/http"
	"os/exec"
)

func (h *APIHandler) Poweroff(w http.ResponseWriter, r *http.Request) {
	out, err := exec.Command("/bin/systemctl", "poweroff").CombinedOutput()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to poweroff reef-pi. Output: "+string(out)+"Error: "+err.Error(), w)
		return
	}
}

func (h *APIHandler) Reboot(w http.ResponseWriter, r *http.Request) {
	out, err := exec.Command("/bin/systemctl", "reboot").CombinedOutput()
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to reboot reef-pi. Output:"+string(out)+". Error: "+err.Error(), w)
		return
	}
}
