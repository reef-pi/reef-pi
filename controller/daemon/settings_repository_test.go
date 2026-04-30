package daemon

import (
	"path/filepath"
	"testing"

	"github.com/reef-pi/reef-pi/controller/settings"
	"github.com/reef-pi/reef-pi/controller/storage"
)

func testSettingsStore(t *testing.T) storage.Store {
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

func TestSettingsRepositorySetupLoadAndUpdate(t *testing.T) {
	store := testSettingsStore(t)
	repo := newSettingsRepository(store)

	initial := settings.DefaultSettings
	initial.Name = "initial"
	if err := repo.Setup(initial); err != nil {
		t.Fatal(err)
	}

	loaded, err := repo.Load()
	if err != nil {
		t.Fatal(err)
	}
	if loaded.Name != "initial" {
		t.Errorf("expected initial settings name, got %q", loaded.Name)
	}

	updated := loaded
	updated.Name = "updated"
	updated.Address = "127.0.0.1:8080"
	if err := repo.Update(updated); err != nil {
		t.Fatal(err)
	}

	loaded, err = repo.Load()
	if err != nil {
		t.Fatal(err)
	}
	if loaded.Name != "updated" {
		t.Errorf("expected updated settings name, got %q", loaded.Name)
	}
	if loaded.Address != "127.0.0.1:8080" {
		t.Errorf("expected updated settings address, got %q", loaded.Address)
	}
}

func TestInitializeSettingsPersistsDevModeDefaults(t *testing.T) {
	originalDefaultSettings := settings.DefaultSettings
	t.Cleanup(func() {
		settings.DefaultSettings = originalDefaultSettings
	})
	t.Setenv("DEV_MODE", "1")

	store := testSettingsStore(t)
	initialized, err := initializeSettings(store)
	if err != nil {
		t.Fatal(err)
	}
	if !initialized.Capabilities.DevMode {
		t.Fatal("expected initialized settings to enable dev mode")
	}

	loaded, err := newSettingsRepository(store).Load()
	if err != nil {
		t.Fatal(err)
	}
	if !loaded.Capabilities.DevMode {
		t.Error("expected persisted settings to enable dev mode")
	}
	if loaded.Address != "0.0.0.0:8080" {
		t.Errorf("expected persisted dev mode address, got %q", loaded.Address)
	}
}
