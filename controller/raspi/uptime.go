package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"time"
)

type TimeLog struct {
	Time    string `json:"time"`
	StartUp bool   `json:"startup"` // true if start, false if stop
}

func (r *Raspi) initUptimeBucket() error {
	return r.store.CreateBucket("uptime")
}

func (r *Raspi) logStartTime() error {
	if err := r.initUptimeBucket(); err != nil {
		return err
	}
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: true,
	}
	fn := func(id string) interface{} {
		return l
	}
	return r.store.Create("uptime", fn)
}

func (r *Raspi) logStopTime() error {
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: false,
	}
	fn := func(id string) interface{} {
		return l
	}
	return r.store.Create("uptime", fn)
}

func (r *Raspi) lastStartTime() (t string, err error) {
	err = r.store.DB().View(func(tx *bolt.Tx) error {
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

func (r *Raspi) lastStopTime() (t string, err error) {
	err = r.store.DB().View(func(tx *bolt.Tx) error {
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

func (r *Raspi) StartTime() string {
	t, _ := r.lastStartTime()
	return t

}
