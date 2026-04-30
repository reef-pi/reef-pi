//go:build !windows
// +build !windows

package storage

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
		t.Fatal("Failed to create test database")
	}
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
		t.Fatal("Fetched data is inconsistent with stored data. Expected: 'fake', Found: ", nData.Name)
	}
	var ls []testData
	lsFn := func(_ string, bs []byte) error {
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

	// Buckets
	buckets, err := store.Buckets()
	if err != nil {
		t.Fatal("Buckets() failed:", err)
	}
	found := false
	for _, b := range buckets {
		if b == testBucket {
			found = true
		}
	}
	if !found {
		t.Error("Expected test bucket in Buckets() output")
	}
	if err := store.DeleteBucket(testBucket); err != nil {
		t.Fatal("DeleteBucket() failed:", err)
	}
	if err := store.List(testBucket, lsFn); err == nil {
		t.Fatal("Expected deleted bucket to be unavailable")
	}

	// Path
	if p := store.Path(); p == "" {
		t.Error("Expected non-empty path from store.Path()")
	}

	// SubBucket returns a store
	sub := store.SubBucket(testBucket, "sub")
	if sub == nil {
		t.Error("Expected non-nil SubBucket")
	}

	store.Close()
}

func TestSubBuckets(t *testing.T) {
	db, err := TestDB()
	if err != nil {
		t.Fatal(err)
	}
	if err := db.CreateBucket("parent"); err != nil {
		t.Fatal(err)
	}

	// TestDB returns a *store; since we are in the same package we can use NewStore directly
	path := db.Path()
	db.Close()

	conc, err := NewStore(path)
	if err != nil {
		t.Fatal(err)
	}
	defer conc.Close()

	if err := conc.CreateSubBucket("parent", "child"); err != nil {
		t.Error("CreateSubBucket failed:", err)
	}
	if err := conc.CreateSubBucket("missing-parent", "child"); err == nil {
		t.Error("Expected error for non-existent parent bucket")
	}
}
