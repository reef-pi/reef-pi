package utils

import (
	"sync"
	"testing"
	"time"
)

func TestKeyedWorkersReplacesWorkerAfterJoin(t *testing.T) {
	var workers KeyedWorkers
	started := make(chan int, 2)
	firstStopped := make(chan struct{})
	workers.Start("sensor", func(stop <-chan struct{}) {
		started <- 1
		<-stop
		close(firstStopped)
	})
	<-started
	workers.Start("sensor", func(stop <-chan struct{}) {
		select {
		case <-firstStopped:
		case <-time.After(time.Second):
			t.Error("replacement started before previous worker stopped")
		}
		started <- 2
		<-stop
	})
	if got := <-started; got != 2 {
		t.Fatalf("replacement worker id = %d, want 2", got)
	}
	if !workers.Stop("sensor") {
		t.Fatal("Stop did not find replacement worker")
	}
}

func TestKeyedWorkersConcurrentAndRepeatedStop(t *testing.T) {
	var workers KeyedWorkers
	started := make(chan struct{})
	workers.Start("sensor", func(stop <-chan struct{}) {
		close(started)
		<-stop
	})
	<-started

	const callers = 8
	var wg sync.WaitGroup
	for i := 0; i < callers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			workers.Stop("sensor")
		}()
	}
	wg.Wait()
	if workers.Stop("sensor") {
		t.Fatal("repeated Stop unexpectedly found a worker")
	}
	if got := workers.Count(); got != 0 {
		t.Fatalf("worker count = %d, want 0", got)
	}
}

func TestKeyedWorkersStopAllWaitsForWorkers(t *testing.T) {
	var workers KeyedWorkers
	started := make(chan struct{}, 2)
	release := make(chan struct{})
	for _, key := range []string{"one", "two"} {
		workers.Start(key, func(stop <-chan struct{}) {
			started <- struct{}{}
			<-stop
			<-release
		})
	}
	<-started
	<-started

	stopped := make(chan []string, 1)
	go func() { stopped <- workers.StopAll() }()
	select {
	case <-stopped:
		t.Fatal("StopAll returned before workers completed")
	case <-time.After(20 * time.Millisecond):
	}
	close(release)
	select {
	case keys := <-stopped:
		if len(keys) != 2 {
			t.Fatalf("stopped %d keys, want 2", len(keys))
		}
	case <-time.After(time.Second):
		t.Fatal("StopAll did not return after workers completed")
	}
	if got := workers.Count(); got != 0 {
		t.Fatalf("worker count = %d, want 0", got)
	}
}
