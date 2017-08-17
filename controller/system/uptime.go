package system

import (
	"github.com/dustin/go-humanize"
	"log"
	"time"
)

type TimeLog struct {
	Time string `json:"time"`
}

func (c *Controller) logStartTime() error {
	l := TimeLog{
		Time: time.Now().Format(time.RFC3339),
	}
	return c.store.CreateWithID(Bucket, "start_time", &l)
}

func (c *Controller) logStopTime() error {
	l := TimeLog{
		Time: time.Now().Format(time.RFC3339),
	}
	return c.store.CreateWithID(Bucket, "stop_time", &l)
}

func (c *Controller) lastStartTime() (string, error) {
	var t TimeLog
	return t.Time, c.store.Get(Bucket, "start_time", &t)
}

func (c *Controller) lastStopTime() (string, error) {
	var t TimeLog
	return t.Time, c.store.Get(Bucket, "stop_time", &t)
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
