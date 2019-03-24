package daemon

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func (r ReefPi) prometheus() {
	http.Handle("/x/metrics", promhttp.Handler())
}
