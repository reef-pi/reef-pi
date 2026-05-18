package api

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/reef-pi/reef-pi/controller/api/gen"
	equipmentModule "github.com/reef-pi/reef-pi/controller/modules/equipment"
	timerModule "github.com/reef-pi/reef-pi/controller/modules/timer"
	"github.com/reef-pi/reef-pi/controller/storage"
)

// ServerConfig holds optional module controllers. Nil means the module is not loaded.
type ServerConfig struct {
	Equipment *equipmentModule.Controller
	Timer     *timerModule.Controller
}

// ReefPiServer implements gen.StrictServerInterface for all migrated modules.
type ReefPiServer struct {
	equipment *equipmentModule.Controller
	timer     *timerModule.Controller
}

// NewReefPiServer constructs a ReefPiServer from the provided config.
func NewReefPiServer(cfg ServerConfig) *ReefPiServer {
	return &ReefPiServer{
		equipment: cfg.Equipment,
		timer:     cfg.Timer,
	}
}

// isNotFound returns true when the error originates from a missing storage entity.
func isNotFound(err error) bool {
	return errors.Is(err, storage.ErrDoesNotExist)
}

// toGenEquipment converts the module type to the generated API type.
func toGenEquipment(e equipmentModule.Equipment) gen.Equipment {
	return gen.Equipment{
		Id:            &e.ID,
		Name:          e.Name,
		Outlet:        e.Outlet,
		On:            &e.On,
		StayOffOnBoot: &e.StayOffOnBoot,
		BootDelay:     &e.BootDelay,
	}
}

// ---- StrictServerInterface implementation ----

func (s *ReefPiServer) ListEquipment(_ context.Context, _ gen.ListEquipmentRequestObject) (gen.ListEquipmentResponseObject, error) {
	eqs, err := s.equipment.List()
	if err != nil {
		return gen.ListEquipment401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListEquipment200JSONResponse, len(eqs))
	for i, e := range eqs {
		resp[i] = toGenEquipment(e)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateEquipment(_ context.Context, request gen.CreateEquipmentRequestObject) (gen.CreateEquipmentResponseObject, error) {
	if request.Body == nil {
		return gen.CreateEquipment400JSONResponse{Message: "missing request body"}, nil
	}
	b := request.Body
	eq := equipmentModule.Equipment{
		Name:   b.Name,
		Outlet: b.Outlet,
	}
	if b.StayOffOnBoot != nil {
		eq.StayOffOnBoot = *b.StayOffOnBoot
	}
	if b.BootDelay != nil {
		eq.BootDelay = *b.BootDelay
	}
	if err := s.equipment.Create(eq); err != nil {
		return gen.CreateEquipment400JSONResponse{Message: err.Error()}, nil
	}
	// Re-list to find the created item and return it.
	eqs, err := s.equipment.List()
	if err != nil {
		return gen.CreateEquipment400JSONResponse{Message: err.Error()}, nil
	}
	for _, e := range eqs {
		if e.Name == eq.Name && e.Outlet == eq.Outlet {
			return gen.CreateEquipment200JSONResponse(toGenEquipment(e)), nil
		}
	}
	// Fallback: return without a generated ID (Create did succeed).
	return gen.CreateEquipment200JSONResponse(toGenEquipment(eq)), nil
}

func (s *ReefPiServer) GetEquipment(_ context.Context, request gen.GetEquipmentRequestObject) (gen.GetEquipmentResponseObject, error) {
	e, err := s.equipment.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetEquipment401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetEquipment200JSONResponse(toGenEquipment(e)), nil
}

func (s *ReefPiServer) UpdateEquipment(_ context.Context, request gen.UpdateEquipmentRequestObject) (gen.UpdateEquipmentResponseObject, error) {
	existing, err := s.equipment.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.UpdateEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateEquipment401JSONResponse{Message: err.Error()}, nil
	}
	if request.Body == nil {
		return gen.UpdateEquipment400JSONResponse{Message: "missing request body"}, nil
	}
	b := request.Body
	// Apply partial update: only overwrite fields that were provided.
	if b.Name != nil {
		existing.Name = *b.Name
	}
	if b.Outlet != nil {
		existing.Outlet = *b.Outlet
	}
	if b.StayOffOnBoot != nil {
		existing.StayOffOnBoot = *b.StayOffOnBoot
	}
	if b.BootDelay != nil {
		existing.BootDelay = *b.BootDelay
	}
	if err := s.equipment.Update(request.Id, existing); err != nil {
		if isNotFound(err) {
			return gen.UpdateEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateEquipment400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.equipment.Get(request.Id)
	if err != nil {
		return gen.UpdateEquipment400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateEquipment200JSONResponse(toGenEquipment(updated)), nil
}

func (s *ReefPiServer) DeleteEquipment(_ context.Context, request gen.DeleteEquipmentRequestObject) (gen.DeleteEquipmentResponseObject, error) {
	if err := s.equipment.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteEquipment401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteEquipment200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ControlEquipment(_ context.Context, request gen.ControlEquipmentRequestObject) (gen.ControlEquipmentResponseObject, error) {
	if request.Body == nil {
		return gen.ControlEquipment400JSONResponse{Message: "missing request body"}, nil
	}
	if err := s.equipment.Control(request.Id, request.Body.On); err != nil {
		if isNotFound(err) {
			return gen.ControlEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.ControlEquipment400JSONResponse{Message: err.Error()}, nil
	}
	e, err := s.equipment.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.ControlEquipment404JSONResponse{Message: err.Error()}, nil
		}
		return gen.ControlEquipment400JSONResponse{Message: err.Error()}, nil
	}
	return gen.ControlEquipment200JSONResponse(toGenEquipment(e)), nil
}

// ---- Timer ----

func toGenTimerJob(j timerModule.Job) gen.TimerJob {
	var target interface{}
	if len(j.Target) > 0 {
		_ = json.Unmarshal(j.Target, &target)
	}
	enable := j.Enable
	id := j.ID
	return gen.TimerJob{
		Id:     &id,
		Name:   j.Name,
		Enable: &enable,
		Type:   j.Type,
		Month:  j.Month,
		Week:   j.Week,
		Day:    j.Day,
		Hour:   j.Hour,
		Minute: j.Minute,
		Second: j.Second,
		Target: target,
	}
}

func fromGenTimerJob(j gen.TimerJob) timerModule.Job {
	var raw json.RawMessage
	if j.Target != nil {
		raw, _ = json.Marshal(j.Target)
	}
	var enable bool
	if j.Enable != nil {
		enable = *j.Enable
	}
	return timerModule.Job{
		Name:   j.Name,
		Enable: enable,
		Type:   j.Type,
		Month:  j.Month,
		Week:   j.Week,
		Day:    j.Day,
		Hour:   j.Hour,
		Minute: j.Minute,
		Second: j.Second,
		Target: raw,
	}
}

func (s *ReefPiServer) ListTimerJobs(_ context.Context, _ gen.ListTimerJobsRequestObject) (gen.ListTimerJobsResponseObject, error) {
	if s.timer == nil {
		return gen.ListTimerJobs401JSONResponse{Message: "timer subsystem not loaded"}, nil
	}
	jobs, err := s.timer.List()
	if err != nil {
		return gen.ListTimerJobs401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListTimerJobs200JSONResponse, len(jobs))
	for i, j := range jobs {
		resp[i] = toGenTimerJob(j)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateTimerJob(_ context.Context, request gen.CreateTimerJobRequestObject) (gen.CreateTimerJobResponseObject, error) {
	if s.timer == nil {
		return gen.CreateTimerJob401JSONResponse{Message: "timer subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateTimerJob400JSONResponse{Message: "missing request body"}, nil
	}
	job := fromGenTimerJob(*request.Body)
	if err := s.timer.Create(job); err != nil {
		return gen.CreateTimerJob400JSONResponse{Message: err.Error()}, nil
	}
	jobs, err := s.timer.List()
	if err != nil {
		return gen.CreateTimerJob400JSONResponse{Message: err.Error()}, nil
	}
	for _, j := range jobs {
		if j.Name == job.Name && j.Type == job.Type {
			return gen.CreateTimerJob200JSONResponse(toGenTimerJob(j)), nil
		}
	}
	return gen.CreateTimerJob200JSONResponse(toGenTimerJob(job)), nil
}

func (s *ReefPiServer) GetTimerJob(_ context.Context, request gen.GetTimerJobRequestObject) (gen.GetTimerJobResponseObject, error) {
	if s.timer == nil {
		return gen.GetTimerJob401JSONResponse{Message: "timer subsystem not loaded"}, nil
	}
	j, err := s.timer.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetTimerJob404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetTimerJob401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetTimerJob200JSONResponse(toGenTimerJob(j)), nil
}

func (s *ReefPiServer) UpdateTimerJob(_ context.Context, request gen.UpdateTimerJobRequestObject) (gen.UpdateTimerJobResponseObject, error) {
	if s.timer == nil {
		return gen.UpdateTimerJob401JSONResponse{Message: "timer subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateTimerJob400JSONResponse{Message: "missing request body"}, nil
	}
	job := fromGenTimerJob(*request.Body)
	if err := s.timer.Update(request.Id, job); err != nil {
		if isNotFound(err) {
			return gen.UpdateTimerJob404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateTimerJob400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.timer.Get(request.Id)
	if err != nil {
		return gen.UpdateTimerJob400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateTimerJob200JSONResponse(toGenTimerJob(updated)), nil
}

func (s *ReefPiServer) DeleteTimerJob(_ context.Context, request gen.DeleteTimerJobRequestObject) (gen.DeleteTimerJobResponseObject, error) {
	if s.timer == nil {
		return gen.DeleteTimerJob401JSONResponse{Message: "timer subsystem not loaded"}, nil
	}
	if err := s.timer.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteTimerJob404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteTimerJob401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteTimerJob200JSONResponse{Message: "deleted"}, nil
}
