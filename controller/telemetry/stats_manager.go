package telemetry

import (
	"container/ring"
	"encoding/json"
	"fmt"
	"sort"
	"sync"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type Metric interface {
	Rollup(Metric) (Metric, bool)
	Before(Metric) bool
}

// swagger:model statsResponse
type StatsResponse struct {
	Current    []Metric `json:"current"`
	Historical []Metric `json:"historical"`
}
type Stats struct {
	Current    *ring.Ring
	Historical *ring.Ring
}

type StatsOnDisk struct {
	Current    []json.RawMessage `json:"current"`
	Historical []json.RawMessage `json:"historical"`
}

type StatsManager interface {
	Get(string) (StatsResponse, error)
	IsLoaded(string) bool
	Initialize(string) error
	Load(string, func(json.RawMessage) interface{}) error
	Save(string) error
	Update(string, Metric)
	Delete(string) error
}

// Allow storing stats in memory inside ring buffer, serializing it on disk
type mgr struct {
	sync.Mutex
	inMemory        map[string]Stats
	bucket          string
	CurrentLimit    int
	HistoricalLimit int
	store           storage.Store
}

func (m *mgr) IsLoaded(id string) bool {
	_, ok := m.inMemory[id]
	return ok
}

func (m *mgr) Get(id string) (StatsResponse, error) {
	m.Lock()
	defer m.Unlock()
	resp := StatsResponse{
		Current:    []Metric{},
		Historical: []Metric{},
	}
	stats, ok := m.inMemory[id]
	if !ok {
		return resp, fmt.Errorf("stats for id: '%s' not found", id)
	}
	stats.Current.Do(func(i interface{}) {
		if i != nil {
			resp.Current = append(resp.Current, i.(Metric))
		}
	})
	sort.Slice(resp.Current, func(i, j int) bool {
		return resp.Current[i].Before(resp.Current[j])
	})
	stats.Historical.Do(func(i interface{}) {
		if i != nil {
			resp.Historical = append(resp.Historical, i.(Metric))
		}
	})
	sort.Slice(resp.Historical, func(i, j int) bool {
		return resp.Historical[i].Before(resp.Historical[j])
	})
	return resp, nil
}

func (m *mgr) NewStats() Stats {
	return Stats{
		Current:    ring.New(m.CurrentLimit),
		Historical: ring.New(m.HistoricalLimit),
	}
}

func (m *mgr) Load(id string, fn func(json.RawMessage) interface{}) error {
	var resp StatsOnDisk
	if err := m.store.Get(m.bucket, id, &resp); err != nil {
		return err
	}
	stats := m.NewStats()
	for _, c := range resp.Current {
		stats.Current.Value = fn(c)
		stats.Current = stats.Current.Next()
	}
	stats.Current = stats.Current.Prev()
	for _, h := range resp.Historical {
		stats.Historical.Value = fn(h)
		stats.Historical = stats.Historical.Next()
	}
	stats.Historical = stats.Historical.Prev()
	m.Lock()
	m.inMemory[id] = stats
	m.Unlock()
	return nil
}

func (m *mgr) Save(id string) error {
	stats, err := m.Get(id)
	if err != nil {
		return err
	}
	return m.store.Update(m.bucket, id, stats)
}

func (m *mgr) Update(id string, metric Metric) {
	m.Lock()
	stats, ok := m.inMemory[id]
	m.Unlock()
	if !ok {
		stats = m.NewStats()
		stats.Historical.Value = metric
		stats.Current.Value = metric
		stats.Current = stats.Current.Next()
		m.Lock()
		m.inMemory[id] = stats
		m.Unlock()
		return
	}
	var move bool
	stats.Current.Value = metric
	stats.Current = stats.Current.Next()
	if stats.Historical.Value == nil {
		stats.Historical.Value = metric
	} else {
		m1, moved := stats.Historical.Value.(Metric).Rollup(metric)
		move = moved
		if moved {
			m.store.Update(m.bucket, id, stats)
			stats.Historical = stats.Historical.Next()
		}
		stats.Historical.Value = m1
	}
	m.Lock()
	m.inMemory[id] = stats
	m.Unlock()
	if move {
		m.Save(id)
	}
}

func (m *mgr) Initialize(id string) error {
	m.Lock()
	m.inMemory[id] = m.NewStats()
	m.Unlock()
	return nil
}
func (m *mgr) Delete(id string) error {
	m.Lock()
	defer m.Unlock()
	delete(m.inMemory, id)
	return m.store.Delete(m.bucket, id)
}
