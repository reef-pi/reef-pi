package controller

import (
	"bytes"
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/utils"

	"net/http"
	"testing"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func Test_Capabilities(t *testing.T) {
	http.DefaultServeMux = new(http.ServeMux)
	r := &ReefPi{}
	buf := new(bytes.Buffer)
	buf.Write([]byte(`{}`))
	tr := utils.NewTestRouter()
	r.UnAuthenticatedAPI(tr.Router)
	r.AuthenticatedAPI(tr.Router)
	if err := tr.Do("GET", "/api/capabilities", new(bytes.Buffer), nil); err != nil {
		t.Error("Failed to fetch capabilities ror:", err)
	}
	var resp settings.Capabilities
	if err := json.NewDecoder(buf).Decode(&resp); err != nil {
		t.Error(err)
	}
}
