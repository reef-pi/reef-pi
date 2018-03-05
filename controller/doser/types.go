package doser

import (
	"gopkg.in/robfig/cron.v2"
	"strings"
	"time"
)

const Bucket = "doser"

type Pump struct {
	ID       string         `json:"id"`
	Name     string         `json:"name"`
	Jack     string         `json:"jack"`
	Pin      int            `json:"pin"`
	Regiment DosingRegiment `json:"regiment"`
}
type DosingRegiment struct {
	Enable   bool          `json:"enable"`
	Schedule Schedule      `json:"schedule"`
	Duration time.Duration `json:"duration"`
	Speed    int           `json:"speed"`
}
type CalibrationDetails struct {
	Speed    int           `json:"speed"`
	Duration time.Duration `json:"duration"`
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
	_, err := cron.Parse(s.CronSpec())
	return err
}
