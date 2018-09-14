package types

import (
	"encoding/json"
)

type StatsResponse struct {
	Current    []Metric `json:"current"`
	Historical []Metric `json:"historical"`
}

type Metric interface {
	Rollup(Metric) (Metric, bool)
	Before(Metric) bool
}

type StatsManager interface {
	Get(string) (StatsResponse, error)
	Load(string, func(json.RawMessage) interface{}) error
	Save(string) error
	Update(string, Metric)
	Delete(string) error
}

type Telemetry interface {
	Alert(string, string) (bool, error)
	EmitMetric(string, interface{})
	CreateFeedIfNotExist(string)
	DeleteFeedIfExist(string)
}
