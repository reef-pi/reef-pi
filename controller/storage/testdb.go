package storage

import (
	"fmt"
	"os"
	"path/filepath"
)

func TestDB() (Store, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	db := filepath.Join(wd, "test.db")

	_, err = os.Stat(db)

	if !os.IsNotExist(err) {
		err = os.Remove(db)
		if err != nil {
			fmt.Println(err)
		}
	}
	return NewStore(db)
}
