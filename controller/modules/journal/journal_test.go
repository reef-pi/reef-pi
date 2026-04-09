package journal

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/utils"
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

func TestInUse(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()
	refs, err := s.InUse("any", "val")
	if err != nil {
		t.Fatal("InUse returned error:", err)
	}
	if len(refs) != 0 {
		t.Fatalf("Expected 0 refs, got %d", len(refs))
	}
}

func TestGetEntityNotSupported(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()
	if _, err := s.GetEntity("1"); err == nil {
		t.Error("Expected GetEntity to return an error")
	}
}

func TestOnNotSupported(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()
	if err := s.On("1", true); err == nil {
		t.Error("Expected On to return an error")
	}
}

func TestCRUD(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()

	// Create
	p := Parameter{Name: "Salinity", Unit: "ppt", Description: "Salt level"}
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
	if got.Name != "Salinity" {
		t.Errorf("Expected name 'Salinity', got '%s'", got.Name)
	}

	// Update
	got.Name = "Alkalinity"
	if err := s.Update(id, got); err != nil {
		t.Fatal("Update failed:", err)
	}
	updated, err := s.Get(id)
	if err != nil {
		t.Fatal("Get after update failed:", err)
	}
	if updated.Name != "Alkalinity" {
		t.Errorf("Expected name 'Alkalinity', got '%s'", updated.Name)
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

func TestAddEntry(t *testing.T) {
	s, cleanup := newTestSubsystem(t)
	defer cleanup()

	p := Parameter{Name: "pH", Unit: "pH"}
	if err := s.Create(p); err != nil {
		t.Fatal("Create failed:", err)
	}
	list, _ := s.List()
	id := list[0].ID

	e := Entry{Value: 8.2}
	if err := s.AddEntry(id, e); err != nil {
		t.Fatal("AddEntry failed:", err)
	}
	// Second add to exercise the already-loaded path
	e.Value = 8.3
	if err := s.AddEntry(id, e); err != nil {
		t.Fatal("AddEntry (second) failed:", err)
	}
}

func TestAPI(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal("Failed to create test controller:", err)
	}
	defer con.Store().Close()

	s := New(con)
	if err := s.Setup(); err != nil {
		t.Fatal("Setup failed:", err)
	}

	tr := utils.NewTestRouter()
	s.LoadAPI(tr.Router)

	// PUT /api/journal — create
	p := Parameter{Name: "Calcium", Unit: "ppm"}
	body := new(bytes.Buffer)
	json.NewEncoder(body).Encode(p)
	if err := tr.Do("PUT", "/api/journal", body, nil); err != nil {
		t.Fatal("PUT /api/journal failed:", err)
	}

	// GET /api/journal — list
	var list []Parameter
	if err := tr.Do("GET", "/api/journal", strings.NewReader("{}"), &list); err != nil {
		t.Fatal("GET /api/journal failed:", err)
	}
	if len(list) != 1 {
		t.Fatalf("Expected 1 journal parameter, got %d", len(list))
	}
	id := list[0].ID

	// GET /api/journal/{id}
	var got Parameter
	if err := tr.Do("GET", "/api/journal/"+id, strings.NewReader("{}"), &got); err != nil {
		t.Fatal("GET /api/journal/<id> failed:", err)
	}
	if got.Name != "Calcium" {
		t.Errorf("Expected name 'Calcium', got '%s'", got.Name)
	}

	// POST /api/journal/{id} — update
	got.Name = "Magnesium"
	body.Reset()
	json.NewEncoder(body).Encode(got)
	if err := tr.Do("POST", "/api/journal/"+id, body, nil); err != nil {
		t.Fatal("POST /api/journal/<id> failed:", err)
	}

	// POST /api/journal/{id}/record — add entry
	e := Entry{Value: 420.0}
	body.Reset()
	json.NewEncoder(body).Encode(e)
	if err := tr.Do("POST", "/api/journal/"+id+"/record", body, nil); err != nil {
		t.Fatal("POST /api/journal/<id>/record failed:", err)
	}

	// GET /api/journal/{id}/usage
	if err := tr.Do("GET", "/api/journal/"+id+"/usage", strings.NewReader("{}"), nil); err != nil {
		t.Fatal("GET /api/journal/<id>/usage failed:", err)
	}

	// DELETE /api/journal/{id}
	if err := tr.Do("DELETE", "/api/journal/"+id, strings.NewReader("{}"), nil); err != nil {
		t.Fatal("DELETE /api/journal/<id> failed:", err)
	}

	// Confirm deletion
	list = nil
	if err := tr.Do("GET", "/api/journal", strings.NewReader("{}"), &list); err != nil {
		t.Fatal("GET /api/journal after delete failed:", err)
	}
	if len(list) != 0 {
		t.Fatalf("Expected 0 journals after delete, got %d", len(list))
	}
}
