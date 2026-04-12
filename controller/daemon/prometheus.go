package daemon

import (
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func (r ReefPi) prometheus(router *mux.Router) {
	router.Handle("/x/metrics", promhttp.Handler())
}
