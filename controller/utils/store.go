package utils

import (
	"encoding/json"
	"github.com/boltdb/bolt"
	"log"
	"strconv"
	"time"
)

type Store interface {
	Get(string, string, interface{}) error
	List(string, func([]byte) (interface{}, error)) (*[]interface{}, error)
	Create(string, func(string) interface{}) error
	CreateBucket(string) error
	Close() error
	CreateWithID(string, string, interface{}) error
	Update(string, string, interface{}) error
	Delete(string, string) error
}

type store struct {
	db *bolt.DB
}

type Extractor func([]byte) (interface{}, error)

func NewStore(fname string) (*store, error) {
	db, err := bolt.Open(fname, 0600, &bolt.Options{Timeout: 3 * time.Second})
	if err != nil {
		return nil, err
	}
	return &store{db: db}, nil
}

func (s *store) Close() error {
	return s.db.Close()
}

func (s *store) DB() *bolt.DB {
	return s.db
}

func (s *store) CreateBucket(bucket string) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte(bucket)) != nil {
			return nil
		}
		log.Println("Initializing DB for", bucket, "bucket")
		_, err := tx.CreateBucket([]byte(bucket))
		return err
	})
}

func (s *store) Get(bucket, id string, i interface{}) error {
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

func (s *store) List(bucket string, extractor func([]byte) (interface{}, error)) (*[]interface{}, error) {
	list := []interface{}{}
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			entry, err := extractor(v)
			if err != nil {
				return err
			}
			list = append(list, entry)
		}
		return nil
	})
	return &list, err
}

func (s *store) Create(bucket string, updateID func(string) interface{}) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		id, _ := b.NextSequence()
		idString := strconv.Itoa(int(id))
		i := updateID(idString)
		data, err := json.Marshal(i)
		if err != nil {
			return err
		}
		return b.Put([]byte(idString), data)
	})
}

func (s *store) Update(bucket, id string, i interface{}) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		data, err := json.Marshal(i)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
}

func (s *store) Delete(bucket, id string) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		return b.Delete([]byte(id))
	})
}

func (s *store) CreateWithID(bucket, id string, payload interface{}) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		data, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
}
