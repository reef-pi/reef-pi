package timer

import "github.com/go-chi/chi/v5"

// LoadAPI is a no-op: timer routes are owned by the generated OA3 handler in controller/api.
func (c *Controller) LoadAPI(_ chi.Router) {}
