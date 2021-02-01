package timer

import (
	"log"

	"github.com/reef-pi/reef-pi/controller"
)

type TriggerMacro struct {
	ID string `json:"id"`
}

type MacroRunner struct {
	c      controller.Subsystem
	target string
}

func (m *MacroRunner) Run() {
	if err := m.c.On(m.target, false); err != nil {
		log.Println("ERROR: timer sub-system, Failed to complete macro. Error:", err)
	}
	if err := m.c.On(m.target, true); err != nil {
		log.Println("ERROR: timer sub-system, Failed to revert macro. Error:", err)
	}
}
