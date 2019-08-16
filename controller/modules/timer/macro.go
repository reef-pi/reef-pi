package timer

import (
	"github.com/reef-pi/reef-pi/controller"
	"log"
)

type TriggerMacro struct {
	ID string `json:"id"`
}

type MacroRunner struct {
	c      controller.Subsystem
	target string
}

func (m *MacroRunner) Run() {
	if err := m.c.On(m.target, true); err != nil {
		log.Println("ERROR: timer sub-system, Failed to trigger macro. Error:", err)
	}
}
