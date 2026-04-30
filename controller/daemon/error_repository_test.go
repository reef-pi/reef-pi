package daemon

import (
	"encoding/json"
	"path/filepath"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func newErrorRepositoryTestStore(t *testing.T) storage.Store {
	t.Helper()

	store, err := storage.NewStore(filepath.Join(t.TempDir(), "reef-pi.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Error(err)
		}
	})
	return store
}

func TestErrorRepositorySetupCreatesErrorBucket(t *testing.T) {
	store := newErrorRepositoryTestStore(t)
	repo := newErrorRepository(store)

	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	buckets, err := store.Buckets()
	if err != nil {
		t.Fatal(err)
	}
	for _, bucket := range buckets {
		if bucket == storage.ErrorBucket {
			return
		}
	}
	t.Fatalf("expected bucket %q in %v", storage.ErrorBucket, buckets)
}

func TestErrorRepositoryListGetDelete(t *testing.T) {
	store := newErrorRepositoryTestStore(t)
	repo := newErrorRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := repo.Log("test-error", "test message"); err != nil {
		t.Fatal(err)
	}
	if err := repo.Log("test-error-2", "another message"); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("test-error")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "test-error" || got.Message != "test message" || got.Count != 1 {
		t.Fatalf("unexpected error: %#v", got)
	}
	if _, err := time.Parse("Jan 2 15:04:05", got.Time); err != nil {
		t.Fatalf("expected legacy time format, got %q: %v", got.Time, err)
	}

	errors, err := repo.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(errors) != 2 {
		t.Fatalf("expected 2 errors, got %d: %#v", len(errors), errors)
	}

	if err := repo.Delete("test-error"); err != nil {
		t.Fatal(err)
	}
	if _, err := repo.Get("test-error"); err == nil {
		t.Fatal("expected deleted error lookup to fail")
	}
}

func TestErrorRepositoryLogIncrementsExistingErrorCount(t *testing.T) {
	store := newErrorRepositoryTestStore(t)
	repo := newErrorRepository(store)
	if err := repo.Setup(); err != nil {
		t.Fatal(err)
	}

	if err := repo.Log("test-error", "first message"); err != nil {
		t.Fatal(err)
	}
	if err := repo.Log("test-error", "second message"); err != nil {
		t.Fatal(err)
	}

	got, err := repo.Get("test-error")
	if err != nil {
		t.Fatal(err)
	}
	if got.ID != "test-error" {
		t.Fatalf("expected ID to be preserved, got %q", got.ID)
	}
	if got.Message != "second message" {
		t.Fatalf("expected latest message, got %q", got.Message)
	}
	if got.Count != 2 {
		t.Fatalf("expected count 2, got %d", got.Count)
	}

	raw, err := store.RawGet(storage.ErrorBucket, "test-error")
	if err != nil {
		t.Fatal(err)
	}
	var stored map[string]interface{}
	if err := json.Unmarshal(raw, &stored); err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"id", "message", "time", "count"} {
		if _, ok := stored[key]; !ok {
			t.Fatalf("expected stored JSON key %q in %s", key, raw)
		}
	}
}
