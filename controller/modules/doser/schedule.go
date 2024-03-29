package doser

import (
	"strings"

	cron "github.com/robfig/cron/v3"
)

//swagger:model doserSchedule
type Schedule struct {
	Day    string `json:"day"`
	Hour   string `json:"hour"`
	Minute string `json:"minute"`
	Second string `json:"second"`
	Week   string `json:"week"`
	Month  string `json:"month"`
}

func (s Schedule) CronSpec() string {
	return strings.Join([]string{s.Second, s.Minute, s.Hour, s.Day, s.Month, s.Week}, " ")
}

func (s Schedule) Validate() error {
	parser := cron.NewParser(_cronParserSpec)
	_, err := parser.Parse(s.CronSpec())
	return err
}
