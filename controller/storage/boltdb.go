package storage

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	bolt "go.etcd.io/bbolt"
)

type store struct {
	parent string
	db     *bolt.DB
}

type Extractor func([]byte) (interface{}, error)

func NewStore(fname string) (*store, error) {
	db, err := bolt.Open(fname, 0600, &bolt.Options{Timeout: 3 * time.Second})
	if err != nil {
		return nil, err
	}
	return &store{
		db: db,
	}, nil
}

func (s *store) Close() error {
	return s.db.Close()
}

func (s *store) Path() string {
	return s.db.Path()
}

func (s *store) bucket(tx *bolt.Tx, name string) (*bolt.Bucket, error) {
	var b *bolt.Bucket
	if s.parent == "" {
		b = tx.Bucket([]byte(name))
	} else {
		p := tx.Bucket([]byte(s.parent))
		if p == nil {
			return nil, &DoesNotExistError{fmt.Sprintf("Parent bucket: '%s' does not exist.", s.parent)}
		}
		b = p.Bucket([]byte(name))
	}
	if b == nil {
		return nil, &DoesNotExistError{fmt.Sprintf("Bucket: '%s' does not exist.", name)}
	}
	return b, nil
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

func (s *store) RawGet(bucket, id string) ([]byte, error) {
	var data []byte
	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		if b == nil {
			return &DoesNotExistError{fmt.Sprintf("Bucket: '%s' does not exist.", bucket)}
		}
		data = b.Get([]byte(id))
		return nil
	})
	return data, err
}

func (s *store) Get(bucket, id string, i interface{}) error {
	data, err := s.RawGet(bucket, id)
	if err != nil {
		return err
	}
	if data == nil || len(data) == 0 {
		return &DoesNotExistError{fmt.Sprintf("Item '%s' does not exist in bucket '%s'", id, bucket)}
	}
	return json.Unmarshal(data, i)
}

func (s *store) List(bucket string, extractor func(string, []byte) error) error {
	return s.db.View(func(tx *bolt.Tx) error {
		b, err := s.bucket(tx, bucket)
		if err != nil {
			return err
		}
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			if err := extractor(string(k), v); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *store) Create(bucket string, updateID func(string) interface{}) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := s.bucket(tx, bucket)
		if err != nil {
			return err
		}
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

func (s *store) RawUpdate(bucket, id string, buf []byte) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := s.bucket(tx, bucket)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), buf)
	})
}
func (s *store) Update(bucket, id string, i interface{}) error {
	data, err := json.Marshal(i)
	if err != nil {
		return err
	}
	return s.RawUpdate(bucket, id, data)
}

func (s *store) Delete(bucket, id string) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := s.bucket(tx, bucket)
		if err != nil {
			return err
		}
		return b.Delete([]byte(id))
	})
}

func (s *store) CreateWithID(bucket, id string, payload interface{}) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		b, err := s.bucket(tx, bucket)
		if err != nil {
			return err
		}
		data, err := json.Marshal(payload)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
}

func (s *store) Buckets() ([]string, error) {
	var bs []string
	err := s.db.View(func(tx *bolt.Tx) error {
		return tx.ForEach(func(name []byte, _ *bolt.Bucket) error {
			bs = append(bs, string(name))
			return nil
		})
	})
	return bs, err
}

func (s *store) CreateSubBucket(parent, child string) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		p := tx.Bucket([]byte(parent))
		if p == nil {
			return &DoesNotExistError{fmt.Sprintf("Bucket: '%s' does not exist.", parent)}
		}
		_, err := p.CreateBucketIfNotExists([]byte(child))
		return err
	})
}

func (s *store) SubBucket(parent, child string) ObjectStore {
	return &store{
		db:     s.db,
		parent: parent,
	}
}
