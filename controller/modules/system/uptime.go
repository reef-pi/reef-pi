package system

import (
	"log"
	"time"

	humanize "github.com/dustin/go-humanize"
)

type TimeLog struct {
	Time string `json:"time"`
}

func (c *Controller) logStartTime() error {
	l := TimeLog{
		Time: time.Now().Format(time.RFC3339),
	}
	return c.repo.LogStartTime(l)
}

func (c *Controller) logStopTime() error {
	l := TimeLog{
		Time: time.Now().Format(time.RFC3339),
	}
	return c.repo.LogStopTime(l)
}

func (c *Controller) lastStartTime() (string, error) {
	t, err := c.repo.LastStartTime()
	return t.Time, err
}

func (c *Controller) lastStopTime() (string, error) {
	t, err := c.repo.LastStopTime()
	return t.Time, err
}

func (c *Controller) Uptime() string {
	t, err := c.lastStartTime()
	if err != nil {
		log.Println("ERROR:", err)
		return "unknown"
	}
	t1, err := time.Parse(time.RFC3339, t)
	if err != nil {
		log.Println("ERROR:", err)
		return "unknown"
	}
	return humanize.Time(t1)
}
