package storage

import (
	"os"
	"path/filepath"
)

func TestDB() (Store, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	db := filepath.Join(wd, "test.db")
	if _, err := os.Stat(db); !os.IsNotExist(err) {
		os.Remove(db)
	}
	return NewStore(db)
}
