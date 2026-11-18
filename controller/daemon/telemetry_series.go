package daemon

import (
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller"
	phModule "github.com/reef-pi/reef-pi/controller/modules/ph"
	temperatureModule "github.com/reef-pi/reef-pi/controller/modules/temperature"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

// telemetryRanges maps the time ranges the dashboard tiles ask for to how far back they reach.
var telemetryRanges = map[string]time.Duration{
	"1h":  time.Hour,
	"6h":  6 * time.Hour,
	"1d":  24 * time.Hour,
	"7d":  7 * 24 * time.Hour,
	"30d": 30 * 24 * time.Hour,
}

// seriesPoint is one dashboard tile sample: t is Unix milliseconds, v the value.
type seriesPoint struct {
	T int64   `json:"t"`
	V float64 `json:"v"`
}

// observationPoints converts recorded readings into tile samples within the range, oldest first.
// Historical (hourly roll-ups) and current (recent) readings are merged; other metric types are skipped.
func observationPoints(stats telemetry.StatsResponse, since time.Time) []seriesPoint {
	points := []seriesPoint{}
	for _, group := range [][]telemetry.Metric{stats.Historical, stats.Current} {
		for _, metric := range group {
			o, ok := metric.(controller.Observation)
			if !ok {
				continue
			}
			at := time.Time(o.Time)
			if at.Before(since) {
				continue
			}
			points = append(points, seriesPoint{T: at.UnixMilli(), V: o.Value})
		}
	}
	sort.SliceStable(points, func(i, j int) bool { return points[i].T < points[j].T })
	return points
}

// lowestID returns the numerically smallest of the ids, which is the probe the dashboard tile shows.
func lowestID(ids []string) (string, bool) {
	if len(ids) == 0 {
		return "", false
	}
	sort.Slice(ids, func(i, j int) bool {
		a, errA := strconv.Atoi(ids[i])
		b, errB := strconv.Atoi(ids[j])
		if errA == nil && errB == nil {
			return a < b
		}
		return ids[i] < ids[j]
	})
	return ids[0], true
}

func (r *ReefPi) temperatureStats() (telemetry.StatsResponse, bool) {
	sub, err := r.subsystems.Sub(temperatureModule.Bucket)
	if err != nil {
		return telemetry.StatsResponse{}, false
	}
	c, ok := sub.(*temperatureModule.Controller)
	if !ok {
		return telemetry.StatsResponse{}, false
	}
	tcs, err := c.List()
	if err != nil {
		return telemetry.StatsResponse{}, false
	}
	ids := make([]string, len(tcs))
	for i, tc := range tcs {
		ids[i] = tc.ID
	}
	id, ok := lowestID(ids)
	if !ok {
		return telemetry.StatsResponse{}, false
	}
	stats, err := c.Usage(id)
	return stats, err == nil
}

func (r *ReefPi) phStats() (telemetry.StatsResponse, bool) {
	sub, err := r.subsystems.Sub(phModule.Bucket)
	if err != nil {
		return telemetry.StatsResponse{}, false
	}
	c, ok := sub.(*phModule.Controller)
	if !ok {
		return telemetry.StatsResponse{}, false
	}
	probes, err := c.List()
	if err != nil {
		return telemetry.StatsResponse{}, false
	}
	ids := make([]string, len(probes))
	for i, p := range probes {
		ids[i] = p.ID
	}
	id, ok := lowestID(ids)
	if !ok {
		return telemetry.StatsResponse{}, false
	}
	stats, err := c.Readings(id)
	return stats, err == nil
}

// telemetrySeries serves GET /api/telemetry/{metric}?range=..., the time series behind the dashboard
// tiles. temperature.display and ph.display are the recorded readings of the first (lowest id)
// temperature controller / pH probe; any other metric, such as ato.reservoir (ATO records pump
// run time, not a level), or a missing probe answers with an empty series, which the tiles render
// as their no-data state.
func (r *ReefPi) telemetrySeries(w http.ResponseWriter, req *http.Request) {
	metric := chi.URLParam(req, "metric")
	if metric == "" {
		utils.ErrorResponse(http.StatusBadRequest, "metric is required", w)
		return
	}
	rng := req.URL.Query().Get("range")
	if rng == "" {
		rng = "1d"
	}
	window, ok := telemetryRanges[rng]
	if !ok {
		utils.ErrorResponse(http.StatusBadRequest, "unsupported range: "+rng, w)
		return
	}

	var stats telemetry.StatsResponse
	var found bool
	switch metric {
	case "temperature.display":
		stats, found = r.temperatureStats()
	case "ph.display":
		stats, found = r.phStats()
	}
	points := []seriesPoint{}
	if found {
		points = observationPoints(stats, time.Now().Add(-window))
	}
	utils.JSONResponse(points, w, req)
}
