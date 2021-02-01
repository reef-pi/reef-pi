package timer

import (
	"encoding/json"
	"fmt"
	"github.com/reef-pi/reef-pi/controller"
	cron "github.com/robfig/cron/v3"
	"log"
	"time"
)

type Trigger struct {
	ID       string        `json:"id"`
	Revert   bool          `json:"revert"`
	On       bool          `json:"on"`
	Duration time.Duration `json:"duration"`
}

type SubSystemRunner struct {
	Type    string
	sub     controller.Subsystem
	trigger Trigger
}

func NewSubSystemRunner(name string, c controller.Controller, config json.RawMessage) (cron.Job, error) {
	var trigger Trigger
	if err := json.Unmarshal(config, &trigger); err != nil {
		return nil, err
	}
	sub, err := c.Subsystem(name)
	if err != nil {
		return nil, fmt.Errorf("failed to load target subsyetm %s error: %w", name, err)
	}
	return &SubSystemRunner{
		Type:    name,
		sub:     sub,
		trigger: trigger,
	}, nil
}

func (m *SubSystemRunner) Run() {
	if err := m.sub.On(m.trigger.ID, m.trigger.On); err != nil {
		log.Println("ERROR:", m.Type, "sub-system, Failed to trigger. Error:", err)
	}
	if m.trigger.Revert {
		select {
		case <-time.After(m.trigger.Duration * time.Second):
			if err := m.sub.On(m.trigger.ID, !m.trigger.On); err != nil {
				log.Println("ERROR:", m.Type, "sub-system, Failed to revert. Error:", err)
			}
		}
	}
}
