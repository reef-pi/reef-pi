package daemon

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type recordingSmokeResetStore struct {
	calls     []string
	dashboard interface{}
}

func (s *recordingSmokeResetStore) DeleteBucket(bucket string) error {
	s.calls = append(s.calls, "delete:"+bucket)
	return nil
}

func (s *recordingSmokeResetStore) CreateBucket(bucket string) error {
	s.calls = append(s.calls, "create:"+bucket)
	return nil
}

func (s *recordingSmokeResetStore) Update(bucket, id string, value interface{}) error {
	s.calls = append(s.calls, "update:"+bucket+":"+id)
	s.dashboard = value
	return nil
}

func TestSmokeResetServiceResetOrder(t *testing.T) {
	store := &recordingSmokeResetStore{}
	service := smokeResetService{
		store:   store,
		buckets: []string{"first", "second"},
	}

	if err := service.Reset(); err != nil {
		t.Fatal(err)
	}

	expectedCalls := []string{
		"delete:first",
		"create:first",
		"delete:second",
		"create:second",
		"update:reef-pi:dashboard",
	}
	if !reflect.DeepEqual(store.calls, expectedCalls) {
		t.Fatalf("expected calls %v, got %v", expectedCalls, store.calls)
	}
	if !reflect.DeepEqual(store.dashboard, DefaultDashboard) {
		t.Fatalf("expected default dashboard reset, got %#v", store.dashboard)
	}
}

func TestResetSmokeStateUnavailableWithoutDevMode(t *testing.T) {
	s := settings.DefaultSettings
	s.Capabilities.DevMode = false
	r := &ReefPi{settings: s}
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/dev/smoke/reset", nil)

	r.ResetSmokeState(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, w.Code)
	}
	if got := w.Body.String(); !strings.Contains(got, "dev smoke reset unavailable") {
		t.Fatalf("expected unavailable error, got %q", got)
	}
}

func TestResetSmokeStateResetsBucketsAndDashboard(t *testing.T) {
	store, err := storage.NewStore(filepath.Join(t.TempDir(), "reef-pi.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Error(err)
		}
	})
	if err := store.CreateBucket(Bucket); err != nil {
		t.Fatal(err)
	}
	for _, bucket := range smokeResetBuckets {
		if err := store.CreateBucket(bucket); err != nil {
			t.Fatal(err)
		}
	}
	if err := store.Update(storage.EquipmentBucket, "present-before-reset", map[string]string{"name": "pump"}); err != nil {
		t.Fatal(err)
	}
	customDashboard := Dashboard{Column: 2, Row: 2, Width: 100, Height: 100}
	if err := store.Update(Bucket, "dashboard", customDashboard); err != nil {
		t.Fatal(err)
	}

	s := settings.DefaultSettings
	s.Capabilities.DevMode = true
	r := &ReefPi{store: store, settings: s}
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/dev/smoke/reset", bytes.NewBuffer(nil))

	r.ResetSmokeState(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d: %s", http.StatusOK, w.Code, w.Body.String())
	}
	for _, bucket := range smokeResetBuckets {
		count := 0
		if err := store.List(bucket, func(_ string, _ []byte) error {
			count++
			return nil
		}); err != nil {
			t.Fatalf("expected bucket %q to exist after reset: %v", bucket, err)
		}
		if count != 0 {
			t.Fatalf("expected bucket %q to be empty after reset, got %d entries", bucket, count)
		}
	}

	var dashboard Dashboard
	if err := store.Get(Bucket, "dashboard", &dashboard); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(dashboard, DefaultDashboard) {
		t.Fatalf("expected default dashboard, got %#v", dashboard)
	}
}
