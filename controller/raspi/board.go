package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/boltdb/bolt"
	"github.com/ranjib/reefer/controller"
	"log"
	"strconv"
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
	var board controller.Board
	var data []byte

	err := b.db.View(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("boards"))
		data = bu.Get([]byte(name))
		return nil
	})
	if err != nil {
		return nil, err
	}
	if data != nil {
		if err := json.Unmarshal(data, &board); err != nil {
			return nil, err
		}
	}
	return &board, nil
}

func (b *BoardAPI) Update(id string, payload interface{}) error {
	board, ok := payload.(controller.Board)
	if !ok {
		fmt.Errorf("Failed to typecast to board")
	}
	buf, err := json.Marshal(board)
	if err != nil {
		return err
	}
	return b.db.Update(func(tx *bolt.Tx) error {
		bu := tx.Bucket([]byte("boards"))
		return bu.Put([]byte(id), buf)
	})
}

func (b *BoardAPI) Delete(id string) error {
	return b.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("boards"))
		return b.Delete([]byte(id))
	})
}

func (b *BoardAPI) Create(payload interface{}) error {
	board, ok := payload.(controller.Board)
	if !ok {
		return fmt.Errorf("Failed to typecast to equipment")
	}
	return b.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte("boards"))
		id, _ := bucket.NextSequence()
		board.ID = strconv.Itoa(int(id))
		data, err := json.Marshal(board)
		if err != nil {
			return err
		}
		return bucket.Put([]byte(board.ID), data)
	})
}

func (b *BoardAPI) List() (*[]interface{}, error) {
	list := []interface{}{}
	err := b.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte("boards"))
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var board controller.Board
			if err := json.Unmarshal(v, &board); err != nil {
				return err
			}
			list = append(list, board)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &list, nil
}
