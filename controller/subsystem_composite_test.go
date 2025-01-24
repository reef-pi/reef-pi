package controller

import "testing"

func TestSubsystemComposite(t *testing.T) {
	s := NewSubsystemComposite()

	if _, err := s.Sub("noop"); err == nil {
		t.Error("Expected error for unknown subsystem")
	}

	s.Load("noop", NoopSubsystem())
	if _, err := s.Sub("noop"); err != nil {
		t.Error("Expected no error for known subsystem")
	}
	s.Unload("noop")
	if _, err := s.Sub("noop"); err == nil {
		t.Error("Expected error for unknown subsystem")
	}

	s.Load("noop", NoopSubsystem())

	if err := s.Setup(); err != nil {
		t.Error(err)
	}

	s.UnloadAll()

	if _, err := s.Sub("noop"); err == nil {
		t.Error("Expected error for unknown subsystem")
	}
}
