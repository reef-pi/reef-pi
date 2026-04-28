package daemon

import (
	"errors"
	"strings"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"

	"net/http"
	"testing"
)

type failingStore struct {
	closed bool
}

func (s *failingStore) Close() error {
	s.closed = true
	return nil
}

func (s *failingStore) Buckets() ([]string, error) {
	return nil, errors.New("not implemented")
}

func (s *failingStore) CreateBucket(string) error {
	return errors.New("create bucket failed")
}

func (s *failingStore) DeleteBucket(string) error {
	return errors.New("not implemented")
}

func (s *failingStore) Path() string {
	return ""
}

func (s *failingStore) SubBucket(string, string) storage.ObjectStore {
	return s
}

func (s *failingStore) RawGet(string, string) ([]byte, error) {
	return nil, errors.New("get failed")
}

func (s *failingStore) Get(string, string, interface{}) error {
	return errors.New("get failed")
}

func (s *failingStore) List(string, func(string, []byte) error) error {
	return errors.New("not implemented")
}

func (s *failingStore) Create(string, func(string) interface{}) error {
	return errors.New("not implemented")
}

func (s *failingStore) CreateWithID(string, string, interface{}) error {
	return errors.New("not implemented")
}

func (s *failingStore) Update(string, string, interface{}) error {
	return errors.New("not implemented")
}

func (s *failingStore) RawUpdate(string, string, []byte) error {
	return errors.New("not implemented")
}

func (s *failingStore) Delete(string, string) error {
	return errors.New("not implemented")
}

func TestNewReefPiClosesStoreOnInitializationFailure(t *testing.T) {
	store := &failingStore{}
	_, err := newReefPi("0.1", store)
	if err == nil {
		t.Fatal("expected initialization error")
	}
	if !strings.Contains(err.Error(), "initialize default settings") {
		t.Fatalf("expected settings initialization error, got %v", err)
	}
	if !store.closed {
		t.Fatal("expected store to be closed after initialization failure")
	}
}

func TestReefPi(t *testing.T) {
	http.DefaultServeMux = new(http.ServeMux)
	conf, err := ParseConfig("../../build/config.yaml")
	if err != nil {
		t.Fatal("Failed to parse example config file. Error:", err)
	}
	conf.Database = "reef-pi.db"
	store, err := storage.NewStore(conf.Database)
	defer store.Close()

	if err != nil {
		t.Fatal(err)
	}
	initializeSettings(store)
	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	if err := store.Update(Bucket, "settings", s); err != nil {
		t.Fatal(err)
	}
	store.Close()
	r, err := New("0.1", conf.Database)
	if err != nil {
		t.Fatal("Failed to create new reef-pi controller. Error:", err)
	}
	r.settings.Capabilities.DevMode = true
	r.settings.Capabilities.Doser = true
	r.settings.Capabilities.Lighting = true
	r.settings.Capabilities.Camera = true
	r.settings.Capabilities.Equipment = true
	r.settings.Capabilities.Timers = true
	r.settings.Capabilities.Ph = true
	if err := r.Start(); err != nil {
		t.Fatal("Failed to load subsystem. Error:", err)
	}
	if err := r.API(); err != nil {
		t.Error(err)
	}
	if _, err := r.Subsystem("timers"); err != nil {
		t.Error(err)
	}
	if _, err := r.Subsystem("invalid"); err == nil {
		t.Errorf("invalid subsystem fetch should fail")
	}
	if err := r.Stop(); err != nil {
		t.Fatal(err)
	}

}
