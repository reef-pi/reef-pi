package ph

import (
	"sync"
	"testing"
	"time"
)

func TestPHStopWaitsForPollerExit(t *testing.T) {
	ctrl := setupPHController(t)
	defer ctrl.c.Store().Close()

	started := make(chan struct{})
	readyToExit := make(chan struct{})
	releaseExit := make(chan struct{})
	ctrl.pollerRunner = func(_ Probe, quit <-chan struct{}) error {
		close(started)
		<-quit
		close(readyToExit)
		<-releaseExit
		return nil
	}
	if err := ctrl.Create(Probe{Name: "poller", Enable: true, Period: 1}); err != nil {
		t.Fatal(err)
	}
	select {
	case <-started:
	case <-time.After(time.Second):
		t.Fatal("poller did not start")
	}

	stopped := make(chan struct{})
	go func() {
		ctrl.Stop()
		close(stopped)
	}()
	select {
	case <-readyToExit:
	case <-time.After(time.Second):
		t.Fatal("Stop did not signal the poller")
	}
	select {
	case <-stopped:
		t.Fatal("Stop returned before the poller exited")
	case <-time.After(20 * time.Millisecond):
	}
	close(releaseExit)
	select {
	case <-stopped:
	case <-time.After(time.Second):
		t.Fatal("Stop did not return after the poller exited")
	}
}

func TestManagedOneShotStillDisablesAfterInRangeReading(t *testing.T) {
	ctrl := setupPHController(t)
	defer ctrl.c.Store().Close()

	probe := Probe{
		Name: "one-shot", Enable: true, OneShot: true, Period: 1,
		Min: 0, Max: 100,
	}
	if err := ctrl.Create(probe); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		updated, err := ctrl.Get("1")
		if err != nil {
			t.Fatal(err)
		}
		if !updated.Enable {
			ctrl.Stop()
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	ctrl.Stop()
	t.Fatal("one-shot probe did not disable after an in-range reading")
}

func TestConcurrentPHLifecycleOperations(t *testing.T) {
	ctrl := setupPHController(t)
	defer ctrl.c.Store().Close()

	var mu sync.Mutex
	active := make(map[string]int)
	maxActive := make(map[string]int)
	ctrl.pollerRunner = func(p Probe, quit <-chan struct{}) error {
		mu.Lock()
		active[p.ID]++
		if active[p.ID] > maxActive[p.ID] {
			maxActive[p.ID] = active[p.ID]
		}
		mu.Unlock()
		<-quit
		mu.Lock()
		active[p.ID]--
		mu.Unlock()
		return nil
	}

	initial := Probe{Name: "initial", Enable: true, Period: 1}
	if err := ctrl.Create(initial); err != nil {
		t.Fatal(err)
	}
	const workers = 4
	start := make(chan struct{})
	var wg sync.WaitGroup
	for worker := 0; worker < workers; worker++ {
		wg.Add(1)
		go func(worker int) {
			defer wg.Done()
			<-start
			switch worker {
			case 0:
				for i := 0; i < 20; i++ {
					p := initial
					p.Enable = i%2 == 0
					_ = ctrl.Update("1", p)
				}
			case 1:
				_ = ctrl.Delete("1")
			case 2:
				ctrl.Stop()
			case 3:
				for i := 0; i < 5; i++ {
					p := Probe{Name: "created", Enable: true, Period: 1}
					_ = ctrl.Create(p)
				}
			}
		}(worker)
	}
	close(start)
	wg.Wait()
	ctrl.Stop()

	mu.Lock()
	defer mu.Unlock()
	if maxActive["1"] > 1 {
		t.Fatalf("probe 1 had %d concurrent pollers", maxActive["1"])
	}
	for id, count := range active {
		if count != 0 {
			t.Errorf("poller %s remained active after Stop: %d", id, count)
		}
	}
	remaining := ctrl.workers.Count()
	if remaining != 0 {
		t.Fatalf("%d pollers remained registered after Stop", remaining)
	}
}
