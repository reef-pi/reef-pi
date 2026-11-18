package daemon

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// alertPollInterval is how often an open alert stream checks the error log for news.
var alertPollInterval = time.Second

// alertEvent is the payload of an SSE "alert" event, as consumed by the UI alert center.
type alertEvent struct {
	ID       string `json:"id"`
	Severity string `json:"severity"`
	Title    string `json:"title"`
	Detail   string `json:"detail"`
	TS       int64  `json:"ts"`
}

// streamAlerts serves GET /api/alerts as a Server-Sent Events stream. Errors that were already
// logged when the client connects are not replayed; from then on every newly logged error (or a
// repeat of an existing one) is pushed as a critical "alert" event.
func (r *ReefPi) streamAlerts(w http.ResponseWriter, req *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming is not supported", http.StatusInternalServerError)
		return
	}

	seen := make(map[string]int)
	existing, err := r.ListErrors()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	for _, e := range existing {
		seen[e.ID] = e.Count
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, ": connected\n\n")
	flusher.Flush()

	ticker := time.NewTicker(alertPollInterval)
	defer ticker.Stop()
	for {
		select {
		case <-req.Context().Done():
			return
		case <-ticker.C:
			errs, err := r.ListErrors()
			if err != nil {
				log.Println("ERROR: alert stream failed to list errors:", err)
				continue
			}
			current := make(map[string]int, len(errs))
			for _, e := range errs {
				current[e.ID] = e.Count
				if seen[e.ID] == e.Count {
					continue
				}
				payload, err := json.Marshal(alertEvent{
					ID:       fmt.Sprintf("%s-%d", e.ID, e.Count),
					Severity: "critical",
					Title:    e.Message,
					Detail:   e.ID,
					TS:       time.Now().UnixMilli(),
				})
				if err != nil {
					continue
				}
				fmt.Fprintf(w, "event: alert\ndata: %s\n\n", payload)
			}
			// Forget cleared errors so a recurrence is reported again.
			seen = current
			flusher.Flush()
		}
	}
}
