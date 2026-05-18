package equipment

import (
	"github.com/go-chi/chi/v5"
)

// LoadAPI is a no-op: equipment routes are owned by the generated OA3 handler in controller/api.
func (e *Controller) LoadAPI(_ chi.Router) {}

func (c *Controller) Control(id string, on bool) error {
	e, err := c.Get(id)
	if err != nil {
		return nil
	}
	e.On = on
	return c.Update(e.ID, e)
}
