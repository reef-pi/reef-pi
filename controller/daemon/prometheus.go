package daemon

import (
	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func (r ReefPi) prometheus(router chi.Router) {
	router.Handle("/x/metrics", promhttp.Handler())
}
