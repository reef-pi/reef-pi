package utils

import (
	"container/ring"
	"encoding/json"
	"fmt"
	"sort"
	"sync"
)

type Metric interface {
	Rollup(Metric) (Metric, bool)
	Before(Metric) bool
}

type Stats struct {
	Current    *ring.Ring
	Historical *ring.Ring
}

type StatsResponse struct {
	Current    []Metric `json:"current"`
	Historical []Metric `json:"historical"`
}

type StatsOnDisk struct {
	Current    []json.RawMessage `json:"current"`
	Historical []json.RawMessage `json:"historical"`
}

// Allow storing stats in memory inside ring buffer, serializing it on disk
type StatsManager struct {
	inMemory        map[string]Stats
	bucket          string
	mu              *sync.Mutex
	CurrentLimit    int
	HistoricalLimit int
	store           Store
	SaveOnRollup    bool
}

func NewStatsManager(store Store, b string, c, h int) *StatsManager {
	return &StatsManager{
		inMemory:        make(map[string]Stats),
		bucket:          b,
		mu:              &sync.Mutex{},
		CurrentLimit:    c,
		store:           store,
		HistoricalLimit: h,
		SaveOnRollup:    true,
	}
}

func (m *StatsManager) Get(id string) (StatsResponse, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
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

func (m *StatsManager) NewStats() Stats {
	return Stats{
		Current:    ring.New(m.CurrentLimit),
		Historical: ring.New(m.HistoricalLimit),
	}
}

func (m *StatsManager) Load(id string, fn func(json.RawMessage) interface{}) error {
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
	m.mu.Lock()
	m.inMemory[id] = stats
	m.mu.Unlock()
	return nil
}

func (m *StatsManager) Save(id string) error {
	stats, err := m.Get(id)
	if err != nil {
		return err
	}
	return m.store.Update(m.bucket, id, stats)
}

func (m *StatsManager) Update(id string, metric Metric) {
	m.mu.Lock()
	defer m.mu.Unlock()
	stats, ok := m.inMemory[id]
	if !ok {
		stats = m.NewStats()
		stats.Historical.Value = metric
		stats.Current.Value = metric
		stats.Current = stats.Current.Next()
		m.inMemory[id] = stats
		return
	}
	stats.Current.Value = metric
	stats.Current = stats.Current.Next()
	m1, move := stats.Historical.Value.(Metric).Rollup(metric)
	if move {
		stats.Historical = stats.Historical.Next()
		if m.SaveOnRollup {
			m.store.Update(m.bucket, id, stats)
		}
	}
	stats.Historical.Value = m1
	m.inMemory[id] = stats
}
