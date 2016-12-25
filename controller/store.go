package controller

import (
	"encoding/json"
	"github.com/boltdb/bolt"
)

type Store struct {
	db *bolt.DB
}

func NewStore(db *bolt.DB) *Store {
	return &Store{db: db}
}

func (s *Store) Fetch(bucket, id string, i interface{}) error {
	var data []byte
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		data = b.Get([]byte(id))
		return nil
	})
	if err != nil {
		return err
	}
	return json.Unmarshal(data, i)
}

func (s *Store) Equipment(id string) (e Equipment, err error) {
	err = s.Fetch("equipments", id, &e)
	return
}

func (s *Store) Outlet(id string) (o Outlet, err error) {
	err = s.Fetch("outlets", id, &o)
	return
}
func (s *Store) Job(id string) (j Job, err error) {
	err = s.Fetch("jobs", id, &j)
	return
}
