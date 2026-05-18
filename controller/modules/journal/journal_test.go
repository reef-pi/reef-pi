package journal

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func newTestSubsystem(t *testing.T) (*Subsystem, func()) {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller:", err)
	}
	s := New(con)
	if err := s.Setup(); err != nil {
		con.Store().Close()
		t.Fatal("Failed to setup journal subsystem:", err)
	}
	return s, func() { con.Store().Close() }
}

func TestSetupAndLifecycle(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()
	s.Start()
	s.Stop()
}

func TestAPI(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()

	// Create
	p := Parameter{Name: "Calcium", Unit: "ppm"}
	if err := s.Create(p); err != nil {
		t.Fatal("Create failed:", err)
	}

	// List
	list, err := s.List()
	if err != nil {
		t.Fatal("List failed:", err)
	}
	if len(list) != 1 {
		t.Fatalf("Expected 1 parameter, got %d", len(list))
	}
	id := list[0].ID

	// Get
	got, err := s.Get(id)
	if err != nil {
		t.Fatal("Get failed:", err)
	}
	if got.Name != "Calcium" {
		t.Errorf("Expected name 'Calcium', got '%s'", got.Name)
	}

	// Update
	got.Name = "Magnesium"
	if err := s.Update(id, got); err != nil {
		t.Fatal("Update failed:", err)
	}

	// Record entry
	if err := s.AddEntry(id, Entry{Value: 420.0}); err != nil {
		t.Fatal("AddEntry failed:", err)
	}

	// Usage
	if _, err := s.Usage(id); err != nil {
		t.Fatal("Usage failed:", err)
	}
	if _, err := s.Usage("missing"); err == nil {
		t.Fatal("Expected Usage('missing') to fail")
	}

	// Delete
	if err := s.Delete(id); err != nil {
		t.Fatal("Delete failed:", err)
	}

	list, err = s.List()
	if err != nil {
		t.Fatal("List after delete failed:", err)
	}
	if len(list) != 0 {
		t.Fatalf("Expected 0 parameters after delete, got %d", len(list))
	}
}
