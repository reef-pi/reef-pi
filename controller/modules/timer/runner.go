package timer

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	cron "github.com/robfig/cron/v3"

	"github.com/reef-pi/reef-pi/controller"
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

func NewSubSystemRunner(j Job, c controller.Controller) (cron.Job, error) {
	var trigger Trigger
	if err := json.Unmarshal(j.Target, &trigger); err != nil {
		return nil, err
	}
	sub, err := c.Subsystem(j.Type)
	if err != nil {
		return nil, fmt.Errorf("failed to load target subsyetm %s error: %w", j.Type, err)
	}
	return &SubSystemRunner{
		Type:    j.Type,
		sub:     sub,
		trigger: trigger,
	}, nil
}

func (m *SubSystemRunner) Run() {
	log.Println("timer subsystem. Executing module ", m.Type, "element", m.trigger.ID)
	if err := m.sub.On(m.trigger.ID, m.trigger.On); err != nil {
		log.Println("ERROR:", m.Type, "sub-system, Failed to trigger. Error:", err)
	}
	if m.trigger.Revert {
		select {
		case <-time.After(m.trigger.Duration * time.Second):
			if err := m.sub.On(m.trigger.ID, !m.trigger.On); err != nil {
				log.Println("ERROR:", m.Type, "sub-system, Failed to revert. Error:", err)
			}
			log.Println("timer subsystem. Executing module ", m.Type, "element", m.trigger.ID, "reversed")
		}
	}
}
