package raspi

import (
	"encoding/json"
	"fmt"
	"github.com/ranjib/reefer/controller"
)

type BoardAPI struct {
	store *controller.Store
}

func NewBoardAPI(store *controller.Store) (*BoardAPI, error) {
	if err := store.CreateBucket("boards"); err != nil {
		return nil, err
	}
	return &BoardAPI{store: store}, nil
}

func (b *BoardAPI) Get(id string) (interface{}, error) {
	var board controller.Board
	return &board, b.store.Get("boards", id, &board)
}

func (b *BoardAPI) List() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var board controller.Board
		if err := json.Unmarshal(v, &board); err != nil {
			return nil, err
		}
		return map[string]string{
			"id":   board.ID,
			"name": board.Name,
		}, nil
	}
	return b.store.List("boards", fn)
}

func (b *BoardAPI) Create(payload interface{}) error {
	board, ok := payload.(controller.Board)
	if !ok {
		return fmt.Errorf("Failed to typecast to equipment")
	}
	fn := func(id string) interface{} {
		board.ID = id
		return board
	}
	return b.store.Create("boards", fn)
}

func (b *BoardAPI) Update(id string, payload interface{}) error {
	return b.store.Update("boards", id, payload)
}

func (b *BoardAPI) Delete(id string) error {
	return b.store.Delete("boards", id)
}
