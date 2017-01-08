package controller

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/dustin/go-humanize"
	"log"
	"time"
)

type TimeLog struct {
	Time    string `json:"time"`
	StartUp bool   `json:"startup"` // true if start, false if stop
}

func (c *Controller) initUptimeBucket() error {
	return c.store.CreateBucket("uptime")
}

func (c *Controller) logStartTime() error {
	if err := c.initUptimeBucket(); err != nil {
		return err
	}
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: true,
	}
	fn := func(id string) interface{} {
		return l
	}
	return c.store.Create("uptime", fn)
}

func (c *Controller) logStopTime() error {
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: false,
	}
	fn := func(id string) interface{} {
		return l
	}
	return c.store.Create("uptime", fn)
}

func (c *Controller) lastStartTime() (t string, err error) {
	err = c.store.DB().View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("uptime"))
		c := b.Cursor()
		for k, v := c.Last(); k != nil; k, v = c.Prev() {
			var tl TimeLog
			if err := json.Unmarshal(v, &tl); err != nil {
				return err
			}
			if tl.StartUp {
				t = tl.Time
				return nil
			}
		}
		return nil
	})
	if t == "" {
		err = fmt.Errorf("Last start time not found")
	}
	return
}

func (c *Controller) lastStopTime() (t string, err error) {
	err = c.store.DB().View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("uptime"))
		c := b.Cursor()
		for k, v := c.Last(); k != nil; k, v = c.Prev() {
			var tl TimeLog
			if err := json.Unmarshal(v, &tl); err != nil {
				return err
			}
			if !tl.StartUp {
				t = tl.Time
				return nil
			}
		}
		return nil
	})
	if t == "" {
		err = fmt.Errorf("Last start time not found")
	}
	return
}

func (c *Controller) StartTime() string {
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
