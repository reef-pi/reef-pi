package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"log"
	"strconv"
	"time"
)

type TimeLog struct {
	Time    string `json:"time"`
	StartUp bool   `json:"startup"` // true if start, false if stop
}

func (r *Raspi) initUptimeBucket() error {
	return r.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("uptime"))
		if b == nil {
			log.Println("Initializing DB for uptime bucket")
			b, _ = tx.CreateBucket([]byte("uptime"))
		}
		return nil
	})
}

func (r *Raspi) logStartTime() error {
	if err := r.initUptimeBucket(); err != nil {
		return err
	}
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: true,
	}
	data, err := json.Marshal(l)
	if err != nil {
		return err
	}

	return r.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("uptime"))
		id, _ := b.NextSequence()
		strID := strconv.Itoa(int(id))
		log.Println("Logging start time:", l.Time)
		return b.Put([]byte(strID), data)
	})
}

func (r *Raspi) logStopTime() error {
	l := TimeLog{
		Time:    time.Now().Format(time.RFC3339),
		StartUp: false,
	}

	data, err := json.Marshal(l)
	if err != nil {
		return err
	}

	return r.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("uptime"))
		id, _ := b.NextSequence()
		strID := strconv.Itoa(int(id))
		log.Println("Logging stop time:", l.Time)
		return b.Put([]byte(strID), data)
	})
}

func (r *Raspi) lastStartTime() (t string, err error) {
	err = r.db.View(func(tx *bolt.Tx) error {
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
	err = r.db.View(func(tx *bolt.Tx) error {
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
