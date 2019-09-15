package doser

import (
	"strings"

	cron "gopkg.in/robfig/cron.v3"
)

type DosingRegiment struct {
	Enable   bool     `json:"enable"`
	Schedule Schedule `json:"schedule"`
	Duration float64  `json:"duration"`
	Speed    float64  `json:"speed"`
}

type CalibrationDetails struct {
	Speed    float64 `json:"speed"`
	Duration float64 `json:"duration"`
}

type Schedule struct {
	Day    string `json:"day"`
	Hour   string `json:"hour"`
	Minute string `json:"minute"`
	Second string `json:"second"`
}

func (s Schedule) CronSpec() string {
	return strings.Join([]string{s.Second, s.Minute, s.Hour, s.Day, "*", "?"}, " ")
}

func (s Schedule) Validate() error {
	parser := cron.NewParser(cron.Minute | cron.Hour | cron.Dom | cron.Month | cron.Dow)
	_, err := parser.Parse(s.CronSpec())
	return err
}
