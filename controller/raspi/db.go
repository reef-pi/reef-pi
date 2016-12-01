package raspi

import (
	"github.com/boltdb/bolt"
)

func (r *Raspi) dbPut(bucket, key, value []byte) error {
	return r.db.Update(func(tx *bolt.Tx) error {
		b, err := tx.CreateBucket(bucket)
		if err != nil {
			return err
		}
		b = tx.Bucket(bucket)
		return b.Put(key, value)
	})
}

func (r *Raspi) dbGet(bucket, key []byte) ([]byte, error) {
	var v []byte
	return v, r.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		v = b.Get([]byte(key))
		return nil
	})
}
