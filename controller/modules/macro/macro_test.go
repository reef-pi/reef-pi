package macro

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/utils"
)

func TestMacro(t *testing.T) {
	c, err := controller.TestController()
	defer c.Store().Close()

	if err != nil {
		t.Fatal(err)
	}
	s, err := New(true, c)
	if err != nil {
		t.Error(err)
	}
	if err := s.Setup(); err != nil {
		t.Error(err)
	}
	if err := s.On("", true); err == nil {
		t.Error("Macro subsystem does not support On api yet")
	}
	s.Start()
	tr := utils.NewTestRouter()
	s.LoadAPI(tr.Router)
	steps := []Step{
		{Type: "equipment", Config: []byte("{}")},
	}
	m := Macro{Name: "Foo", Steps: steps}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(m)
	if err := tr.Do("PUT", "/api/macros", body, nil); err != nil {
		t.Error("Failed to create ato using api. Error:", err)
	}
	body.Reset()
	json.NewEncoder(body).Encode(m)
	if err := tr.Do("POST", "/api/macros/1", body, nil); err != nil {
		t.Error("Failed to update ato using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("GET", "/api/macros/1", body, nil); err != nil {
		t.Error("Failed to get using api. Error:", err)
	}
	m.ID = "1"
	if err := s.Run(m, false); err != nil {
		t.Error(err)
	}
	if err := tr.Do("GET", "/api/macros", strings.NewReader(`{}`), nil); err != nil {
		t.Error("Failed to list macros using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("POST", "/api/macros/1/run", strings.NewReader(`{}`), nil); err != nil {
		t.Error("Failed to run  macro using api. Error:", err)
	}
	body.Reset()
	if err := tr.Do("DELETE", "/api/macros/1", body, nil); err != nil {
		t.Error("Failed to delete macro using api. Error:", err)
	}
	s.Stop()
}
