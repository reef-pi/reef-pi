package journal

import "github.com/go-chi/chi/v5"

// LoadAPI is a no-op: journal routes are owned by the generated OA3 handler in controller/api.
func (s *Subsystem) LoadAPI(_ chi.Router) {}
