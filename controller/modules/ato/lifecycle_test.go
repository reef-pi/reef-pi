package ato

import (
	"sync"
	"testing"
	"time"
)

func TestStopWaitsForWorkerStartedByReset(t *testing.T) {
	ctrl := setupATOController(t)
	defer ctrl.c.Store().Close()

	started := make(chan int, 2)
	stopping := make(chan int, 2)
	releaseSecond := make(chan struct{})
	var calls int
	var callsMu sync.Mutex
	ctrl.workerRunner = func(_ ATO, quit chan struct{}) error {
		callsMu.Lock()
		calls++
		call := calls
		callsMu.Unlock()
		started <- call
		<-quit
		stopping <- call
		if call == 2 {
			<-releaseSecond
		}
		return nil
	}

	a := ATO{Name: "reset-worker", Period: 1, Enable: false}
	if err := ctrl.Create(a); err != nil {
		t.Fatal(err)
	}
	a.Enable = true
	if err := ctrl.Update("1", a); err != nil {
		t.Fatal(err)
	}
	awaitWorkerCall(t, started, 1)

	resetDone := make(chan error, 1)
	go func() { resetDone <- ctrl.Reset("1") }()
	awaitWorkerCall(t, stopping, 1)
	awaitWorkerCall(t, started, 2)
	if err := <-resetDone; err != nil {
		t.Fatalf("Reset failed: %v", err)
	}

	stopDone := make(chan struct{})
	go func() {
		ctrl.Stop()
		close(stopDone)
	}()
	awaitWorkerCall(t, stopping, 2)
	select {
	case <-stopDone:
		t.Fatal("Stop returned before the reset-created worker exited")
	case <-time.After(20 * time.Millisecond):
	}
	close(releaseSecond)
	select {
	case <-stopDone:
	case <-time.After(time.Second):
		t.Fatal("Stop did not finish after the reset-created worker exited")
	}
}

func TestConcurrentATOLifecycleOperations(t *testing.T) {
	ctrl := setupATOController(t)
	defer ctrl.c.Store().Close()

	var mu sync.Mutex
	active := make(map[string]int)
	maxActive := make(map[string]int)
	ctrl.workerRunner = func(a ATO, quit chan struct{}) error {
		mu.Lock()
		active[a.ID]++
		if active[a.ID] > maxActive[a.ID] {
			maxActive[a.ID] = active[a.ID]
		}
		mu.Unlock()
		<-quit
		mu.Lock()
		active[a.ID]--
		mu.Unlock()
		return nil
	}

	a := ATO{Name: "lifecycle", Period: 1, Enable: true}
	if err := ctrl.Create(a); err != nil {
		t.Fatal(err)
	}
	start := make(chan struct{})
	var wg sync.WaitGroup
	for operation := 0; operation < 4; operation++ {
		wg.Add(1)
		go func(operation int) {
			defer wg.Done()
			<-start
			switch operation {
			case 0:
				for i := 0; i < 15; i++ {
					a.Enable = i%2 == 0
					_ = ctrl.Update("1", a)
				}
			case 1:
				for i := 0; i < 5; i++ {
					_ = ctrl.Reset("1")
				}
			case 2:
				_ = ctrl.Delete("1")
			case 3:
				ctrl.Stop()
			}
		}(operation)
	}
	close(start)
	wg.Wait()
	ctrl.Stop()

	mu.Lock()
	defer mu.Unlock()
	if maxActive["1"] > 1 {
		t.Fatalf("ATO 1 had %d concurrent workers", maxActive["1"])
	}
	for id, count := range active {
		if count != 0 {
			t.Errorf("worker %s remained active after Stop: %d", id, count)
		}
	}
	ctrl.mu.Lock()
	remaining := len(ctrl.quitters)
	ctrl.mu.Unlock()
	if remaining != 0 {
		t.Fatalf("%d workers remained registered after Stop", remaining)
	}
}

func awaitWorkerCall(t *testing.T, calls <-chan int, want int) {
	t.Helper()
	select {
	case call := <-calls:
		if call != want {
			t.Fatalf("worker call = %d, want %d", call, want)
		}
	case <-time.After(time.Second):
		t.Fatalf("timed out waiting for worker call %d", want)
	}
}
