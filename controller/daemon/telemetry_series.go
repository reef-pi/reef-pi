package daemon

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/utils"
)

// telemetryRanges are the time ranges the dashboard tiles ask for.
var telemetryRanges = map[string]bool{"1h": true, "6h": true, "1d": true, "7d": true, "30d": true}

// telemetrySeries serves GET /api/telemetry/{metric}?range=..., the time series behind the dashboard
// tiles (e.g. temperature.display, ph.display, ato.reservoir). Metrics are not backed by stored
// series yet, so every known range answers with an empty series; the tiles then render their
// "no data" state instead of failing on a 404.
func (r *ReefPi) telemetrySeries(w http.ResponseWriter, req *http.Request) {
	if chi.URLParam(req, "metric") == "" {
		utils.ErrorResponse(http.StatusBadRequest, "metric is required", w)
		return
	}
	rng := req.URL.Query().Get("range")
	if rng == "" {
		rng = "1d"
	}
	if !telemetryRanges[rng] {
		utils.ErrorResponse(http.StatusBadRequest, "unsupported range: "+rng, w)
		return
	}
	utils.JSONResponse([]struct{}{}, w, req)
}
