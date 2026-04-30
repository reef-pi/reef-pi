package telemetry

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller/storage"
)

func TestTelemetryConfigRepositoryGetAndUpdate(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	store.CreateBucket("telemetry")

	repo := newTelemetryConfigRepository(store, "telemetry")
	expected := DefaultTelemetryConfig
	expected.Notify = true
	expected.AdafruitIO.Token = "aio-token"

	if err := repo.update(expected); err != nil {
		t.Fatal(err)
	}

	actual, err := repo.get()
	if err != nil {
		t.Fatal(err)
	}
	if actual.Notify != expected.Notify {
		t.Fatalf("expected notify %t, got %t", expected.Notify, actual.Notify)
	}
	if actual.AdafruitIO.Token != expected.AdafruitIO.Token {
		t.Fatalf("expected AIO token %q, got %q", expected.AdafruitIO.Token, actual.AdafruitIO.Token)
	}
	if actual.CurrentLimit != expected.CurrentLimit {
		t.Fatalf("expected current limit %d, got %d", expected.CurrentLimit, actual.CurrentLimit)
	}

	var saved TelemetryConfig
	if err := store.Get("telemetry", DBKey, &saved); err != nil {
		t.Fatal(err)
	}
	if saved.AdafruitIO.Token != expected.AdafruitIO.Token {
		t.Fatalf("expected persisted AIO token %q, got %q", expected.AdafruitIO.Token, saved.AdafruitIO.Token)
	}
}
