package macro

import (
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestMacro(t *testing.T) {
	c, err := controller.TestController()
	defer c.Store().Close()

	if err != nil {
		t.Fatal(err)
	}
	s, err := New(true, c)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Setup(); err != nil {
		t.Fatal(err)
	}
	// On with b=false is always a no-op (water-full signal, nothing to run)
	if err := s.On("", false); err != nil {
		t.Error("On(false) should be a no-op for macro subsystem, got error:", err)
	}
	// On with b=true and a missing ID should return an error
	if err := s.On("", true); err == nil {
		t.Error("On(true) with invalid macro ID should return an error")
	}
	s.Start()

	steps := []Step{
		{Type: "equipment", Config: []byte("{}")},
	}
	m := Macro{Name: "Foo", Steps: steps}
	if err := s.Create(m); err != nil {
		t.Fatal("Create failed:", err)
	}

	macros, err := s.List()
	if err != nil {
		t.Fatal("List failed:", err)
	}
	if len(macros) != 1 {
		t.Fatalf("Expected 1 macro, got %d", len(macros))
	}
	id := macros[0].ID

	got, err := s.Get(id)
	if err != nil {
		t.Fatal("Get failed:", err)
	}
	got.Name = "Bar"
	if err := s.Update(id, got); err != nil {
		t.Fatal("Update failed:", err)
	}

	if err := s.Run(got, false); err != nil {
		t.Error("Run failed:", err)
	}

	if err := s.Delete(id); err != nil {
		t.Fatal("Delete failed:", err)
	}
	s.Stop()
}

func TestMacroInUseAndGetEntity(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	s, err := New(true, c)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Setup(); err != nil {
		t.Fatal(err)
	}
	s.Start()

	// Create a macro with an equipment step
	steps := []Step{
		{Type: "equipment", Config: []byte(`{"id":"42","on":true}`)},
	}
	m := Macro{Name: "TestMacro", Steps: steps}
	if err := s.Create(m); err != nil {
		t.Fatal("Failed to create macro:", err)
	}

	// InUse for equipment type — should find macro
	deps, err := s.InUse("equipment", "42")
	if err != nil {
		t.Error("InUse(equipment) should not error:", err)
	}
	if len(deps) == 0 {
		t.Error("Expected at least one dep for equipment '42'")
	}

	// InUse for macro type — should also work (macro steps can reference other macros)
	_, err = s.InUse("macro", "99")
	if err != nil {
		t.Error("InUse(macro) should not error:", err)
	}

	// InUse for unknown dep type — should error
	if _, err := s.InUse("unknown", "1"); err == nil {
		t.Error("Expected error for unknown dep type")
	}

	// GetEntity — not supported
	if _, err := s.GetEntity("1"); err == nil {
		t.Error("GetEntity should return error (not supported)")
	}
}

func TestMacroRevertAPI(t *testing.T) {
	c, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer c.Store().Close()

	s, err := New(true, c)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Setup(); err != nil {
		t.Fatal(err)
	}

	steps := []Step{
		{Type: "equipment", Config: []byte(`{"id":"1","on":true}`)},
	}
	m := Macro{Name: "RevMacro", Steps: steps, Reversible: true}
	if err := s.Create(m); err != nil {
		t.Fatal("Failed to create macro:", err)
	}

	macros, err := s.List()
	if err != nil {
		t.Fatal("List failed:", err)
	}
	if len(macros) == 0 {
		t.Fatal("Expected at least one macro")
	}
	if err := s.Run(macros[0], true); err != nil {
		t.Error("revert failed:", err)
	}
}

func TestMacroReversible(t *testing.T) {
	c, err := controller.TestController()
	defer c.Store().Close()

	if err != nil {
		t.Fatal(err)
	}
	s, err := New(true, c)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.Setup(); err != nil {
		t.Fatal(err)
	}

	steps := []Step{
		{Type: "equipment", Config: []byte(`{"id":"1","on":true}`)},
	}
	rev := Macro{Name: "Reversible", Steps: steps, Reversible: true}
	if err := s.Create(rev); err != nil {
		t.Fatal("Failed to create reversible macro:", err)
	}
	rev.ID = "1"
	if err := s.Run(rev, true); err != nil {
		t.Error("Reversible macro with reverse=true should not error:", err)
	}

	// Non-reversible macro run with reverse=true should error
	nonRev := Macro{Name: "NonReversible", Steps: steps, Reversible: false}
	if err := s.Create(nonRev); err != nil {
		t.Fatal("Failed to create non-reversible macro:", err)
	}
	nonRev.ID = "2"
	if err := s.Run(nonRev, true); err == nil {
		t.Error("Expected error running non-reversible macro in reverse")
	}
}
