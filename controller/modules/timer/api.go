package timer

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) LoadAPI(r *mux.Router) {

	// swagger:operation GET /api/timers/{id} Timers timerGet
	// Get timer.
	// Get timer.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the timer
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	//   schema:
	//    $ref: '#/definitions/timerJob'
	r.HandleFunc("/api/timers/{id}", c.GetJob).Methods("GET")

	// swagger:route GET /api/timers Timers timerList
	// List all timer jobs.
	// List all timer jobs in reef-pi.
	// responses:
	// 	200: body:[]timerJob
	r.HandleFunc("/api/timers", c.ListJobs).Methods("GET")

	// swagger:operation PUT /api/timers Timers timerCreate
	// Create a timer job.
	// Create a new timer job.
	// ---
	// parameters:
	//  - in: body
	//    name: timer
	//    description: The timer job to create
	//    required: true
	//    schema:
	//     $ref: '#/definitions/timerJob'
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/timers", c.CreateJob).Methods("PUT")

	// swagger:operation POST /api/timers/{id} Timers timerUpdate
	// Update a timer job.
	// Update an existing timer job.
	//---
	//parameters:
	// - in: path
	//   name: id
	//   description: The Id of the timer job to update
	//   required: true
	//   schema:
	//    type: integer
	// - in: body
	//   name: timer
	//   description: The timer job to update
	//   required: true
	//   schema:
	//    $ref: '#/definitions/timerJob'
	//responses:
	// 200:
	//  description: OK
	// 404:
	//  description: Not Found
	r.HandleFunc("/api/timers/{id}", c.UpdateJob).Methods("POST")

	// swagger:operation DELETE /api/timers/{id} Timers timerDelete
	// Delete a timer job.
	// Delete an existing timer job.
	// ---
	// parameters:
	//  - in: path
	//    name: id
	//    description: The Id of the timer job to delete
	//    required: true
	//    schema:
	//     type: integer
	// responses:
	//  200:
	//   description: OK
	r.HandleFunc("/api/timers/{id}", c.DeleteJob).Methods("DELETE")
}

func (c *Controller) GetJob(w http.ResponseWriter, r *http.Request) {
	fn := func(id string) (interface{}, error) {
		return c.Get(id)
	}
	utils.JSONGetResponse(fn, w, r)
}

func (c *Controller) ListJobs(w http.ResponseWriter, r *http.Request) {
	fn := func() (interface{}, error) {
		return c.List()
	}
	utils.JSONListResponse(fn, w, r)
}

func (c *Controller) CreateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func() error {
		return c.Create(j)
	}
	utils.JSONCreateResponse(&j, fn, w, r)
}

func (c *Controller) UpdateJob(w http.ResponseWriter, r *http.Request) {
	var j Job
	fn := func(id string) error {
		j.ID = id
		return c.Update(id, j)
	}
	utils.JSONUpdateResponse(&j, fn, w, r)
}

func (c *Controller) DeleteJob(w http.ResponseWriter, r *http.Request) {
	utils.JSONDeleteResponse(c.Delete, w, r)
}
