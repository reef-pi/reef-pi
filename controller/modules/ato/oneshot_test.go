package ato

import (
	"testing"
	"time"
)

// Regression test for #1356: turning on a one-shot ATO (e.g. from a macro step)
// must return immediately and leave a loop that can be stopped, instead of
// blocking the caller until the sensor reads full.
func TestOneShotOnDoesNotBlock(t *testing.T) {
	c := setupATOController(t)

	a := ATO{Name: "oneshot", Control: true, Inlet: "1", Period: 1, Pump: "1", OneShot: true, Enable: false}
	if err := c.Create(a); err != nil {
		t.Fatal("Failed to create ato:", err)
	}

	done := make(chan error, 1)
	go func() { done <- c.On("1", true) }()
	select {
	case err := <-done:
		if err != nil {
			t.Fatal("On returned error:", err)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("On(oneshot, true) blocked: one-shot loop must run in the background")
	}

	c.mu.Lock()
	_, running := c.quitters["1"]
	c.mu.Unlock()
	if !running {
		t.Fatal("one-shot loop was not registered, so it could never be stopped")
	}

	// Turning it off must stop the loop.
	if err := c.On("1", false); err != nil {
		t.Fatal(err)
	}
	c.mu.Lock()
	_, running = c.quitters["1"]
	c.mu.Unlock()
	if running {
		t.Fatal("one-shot loop still registered after turning it off")
	}

	stopped := make(chan struct{})
	go func() { c.Stop(); close(stopped) }()
	select {
	case <-stopped:
	case <-time.After(3 * time.Second):
		t.Fatal("Stop did not return: an ATO loop was left running")
	}
}

func TestDeleteAndResetStopLoop(t *testing.T) {
	c := setupATOController(t)

	a := ATO{Name: "loop", Control: true, Inlet: "1", Period: 1, Pump: "1", Enable: true}
	if err := c.Create(a); err != nil {
		t.Fatal("Failed to create ato:", err)
	}
	if err := c.Reset("1"); err != nil {
		t.Fatal("Reset failed:", err)
	}
	if err := c.Delete("1"); err != nil {
		t.Fatal("Delete failed:", err)
	}
	c.mu.Lock()
	n := len(c.quitters)
	c.mu.Unlock()
	if n != 0 {
		t.Fatalf("expected no running loops after delete, got %d", n)
	}

	stopped := make(chan struct{})
	go func() { c.Stop(); close(stopped) }()
	select {
	case <-stopped:
	case <-time.After(3 * time.Second):
		t.Fatal("Stop did not return after Reset/Delete")
	}
}
