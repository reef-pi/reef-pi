package utils

import (
	"encoding/json"
	"testing"
)

type testData struct {
	ID   string
	Name string
}

func TestStore(t *testing.T) {
	testBucket := "test"
	store, err := TestDB()
	if err != nil {
		t.Fatal("Failed to create test databse")
	}
	defer store.Close()
	if err := store.CreateBucket(testBucket); err != nil {
		t.Fatal("Failed to create test bucket. Error:", err)
	}
	data := testData{
		Name: "fake",
	}
	createFn := func(id string) interface{} {
		data.ID = id
		return &data
	}
	if err := store.Create(testBucket, createFn); err != nil {
		t.Fatal("Failed to store test object. Error:", err)
	}
	var nData testData
	if err := store.Get(testBucket, data.ID, &nData); err != nil {
		t.Fatal("Failed to fetch test object. Error:", err)
	}
	if nData.Name != "fake" {
		t.Fatal("Fetched data is inconsitent with stored data. Expected: 'fake', Found: ", nData.Name)
	}
	var ls []testData
	lsFn := func(bs []byte) error {
		var d testData
		if err := json.Unmarshal(bs, &d); err != nil {
			return err
		}
		ls = append(ls, d)
		return nil
	}
	if err := store.List(testBucket, lsFn); err != nil {
		t.Fatal("List elements call failed. Error:", err)
	}
	if ls[0].Name != "fake" {
		t.Fatal("Expected name: 'fake', found:", ls[0].Name)
	}
	data.Name = "real"
	if err := store.Update(testBucket, data.ID, data); err != nil {
		t.Fatal("Failed to update data. Error:", err)
	}
	if err := store.Delete(testBucket, data.ID); err != nil {
		t.Fatal("Failed to delete. Error:", err)
	}
	if err := store.CreateWithID(testBucket, "test-id", data); err != nil {
		t.Fatal("Failed to store with explicit ID. Error:", err)
	}
}
