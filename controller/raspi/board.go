package raspi

import (
	"encoding/json"
	"github.com/boltdb/bolt"
	"log"
)

type BoardAPI struct {
	db *bolt.DB
}

func NewBoardAPI(db *bolt.DB) (*BoardAPI, error) {
	err := db.Update(func(tx *bolt.Tx) error {
		if tx.Bucket([]byte("boards")) != nil {
			return nil
		}
		log.Println("Initializing DB for boards bucket")
		_, err := tx.CreateBucket([]byte("boards"))
		return err
	})
	if err != nil {
		return nil, err
	}
	return &BoardAPI{db: db}, nil
}

func (b *BoardAPI) Get(name string) (interface{}, error) {
	var data []byte

	err := b.db.View(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("boards"))
		data = bu.Get([]byte(name))
		return nil
	})
	if err != nil {
		return nil, err
	}
	pinLayout := map[string]string{}
	if data != nil {
		if err := json.Unmarshal(data, &pinLayout); err != nil {
			return nil, err
		}
	}
	return pinLayout, nil
}

func (b *BoardAPI) Update(name string, pinLayout interface{}) error {
	buf, err := json.Marshal(pinLayout)
	if err != nil {
		return err
	}
	return b.db.Update(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("boards"))
		return bu.Put([]byte(name), buf)
	})
}

func (b *BoardAPI) Delete(_ string) error {
	return nil
}

func (b *BoardAPI) Create(_ interface{}) error {
	return nil
}

func (b *BoardAPI) List() (*[]interface{}, error) {
	var ret []interface{}
	return &ret, nil
}
