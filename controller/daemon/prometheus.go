package daemon

import (
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

func (r ReefPi) prometheus() {
	http.Handle("/api/metrics", promhttp.Handler())
}
