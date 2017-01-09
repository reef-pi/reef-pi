package controller

import (
	"encoding/json"
)

const BoardBucket = "boards"

type Board struct {
	ID     string          `json:"id"`
	Name   string          `json:"name"`
	Pins   uint            `json:"pins"`
	Config json.RawMessage `json:"config"`
}

func (c *Controller) GetBoard(id string) (Board, error) {
	var board Board
	return board, c.store.Get(BoardBucket, id, &board)
}

func (c *Controller) ListBoards() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var board Board
		return &board, json.Unmarshal(v, &board)
	}
	return c.store.List(BoardBucket, fn)
}

func (c *Controller) CreateBoard(board Board) error {
	fn := func(id string) interface{} {
		board.ID = id
		return board
	}
	return c.store.Create(BoardBucket, fn)
}

func (c *Controller) UpdateBoard(id string, payload Board) error {
	return c.store.Update(BoardBucket, id, payload)
}

func (c *Controller) DeleteBoard(id string) error {
	return c.store.Delete(BoardBucket, id)
}
