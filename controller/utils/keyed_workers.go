package utils

import "sync"

// KeyedWorkers tracks cancellable background workers by key. Starting an
// existing key cancels and joins its worker before the replacement starts.
// Stop and StopAll cancel workers and wait for their functions to return.
// Worker functions must not call Start, Stop, or StopAll on this manager.
type KeyedWorkers struct {
	operationMu sync.Mutex
	mu          sync.Mutex
	workers     map[string]keyedWorker
}

type keyedWorker struct {
	stop chan struct{}
	done chan struct{}
}

func (w *KeyedWorkers) Start(key string, run func(<-chan struct{})) {
	w.operationMu.Lock()
	defer w.operationMu.Unlock()

	w.mu.Lock()
	previous, exists := w.workers[key]
	if exists {
		delete(w.workers, key)
		close(previous.stop)
	}
	w.mu.Unlock()
	if exists {
		<-previous.done
	}

	worker := keyedWorker{stop: make(chan struct{}), done: make(chan struct{})}
	w.mu.Lock()
	if w.workers == nil {
		w.workers = make(map[string]keyedWorker)
	}
	w.workers[key] = worker
	w.mu.Unlock()
	go func() {
		defer close(worker.done)
		run(worker.stop)
	}()
}

func (w *KeyedWorkers) Stop(key string) bool {
	w.operationMu.Lock()
	defer w.operationMu.Unlock()

	w.mu.Lock()
	worker, exists := w.workers[key]
	if exists {
		delete(w.workers, key)
		close(worker.stop)
	}
	w.mu.Unlock()
	if exists {
		<-worker.done
	}
	return exists
}

// StopAll cancels and joins every registered worker and returns the stopped
// keys so owners can perform worker-specific shutdown work afterward.
func (w *KeyedWorkers) StopAll() []string {
	w.operationMu.Lock()
	defer w.operationMu.Unlock()

	w.mu.Lock()
	workers := w.workers
	w.workers = make(map[string]keyedWorker)
	keys := make([]string, 0, len(workers))
	for key, worker := range workers {
		keys = append(keys, key)
		close(worker.stop)
	}
	w.mu.Unlock()
	for _, worker := range workers {
		<-worker.done
	}
	return keys
}

func (w *KeyedWorkers) Count() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return len(w.workers)
}
