package api

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/api/gen"
	atoModule "github.com/reef-pi/reef-pi/controller/modules/ato"
	cameraModule "github.com/reef-pi/reef-pi/controller/modules/camera"
	doserModule "github.com/reef-pi/reef-pi/controller/modules/doser"
	equipmentModule "github.com/reef-pi/reef-pi/controller/modules/equipment"
	journalModule "github.com/reef-pi/reef-pi/controller/modules/journal"
	lightingModule "github.com/reef-pi/reef-pi/controller/modules/lighting"
	macroModule "github.com/reef-pi/reef-pi/controller/modules/macro"
	phModule "github.com/reef-pi/reef-pi/controller/modules/ph"
	systemModule "github.com/reef-pi/reef-pi/controller/modules/system"
	temperatureModule "github.com/reef-pi/reef-pi/controller/modules/temperature"
	timerModule "github.com/reef-pi/reef-pi/controller/modules/timer"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

// ServerConfig holds optional module controllers. Nil means the module is not loaded.
type ServerConfig struct {
	Equipment   *equipmentModule.Controller
	Journal     *journalModule.Subsystem
	Timer       *timerModule.Controller
	Macro       *macroModule.Subsystem
	Lighting    *lightingModule.Controller
	ATO         *atoModule.Controller
	Camera      *cameraModule.Controller
	Doser       *doserModule.Controller
	PH          *phModule.Controller
	Temperature *temperatureModule.Controller
	System      *systemModule.Controller
}

// ReefPiServer implements gen.StrictServerInterface for all migrated modules.
type ReefPiServer struct {
	equipment   *equipmentModule.Controller
	journal     *journalModule.Subsystem
	timer       *timerModule.Controller
	macro       *macroModule.Subsystem
	lighting    *lightingModule.Controller
	ato         *atoModule.Controller
	camera      *cameraModule.Controller
	doser       *doserModule.Controller
	ph          *phModule.Controller
	temperature *temperatureModule.Controller
	system      *systemModule.Controller
}

// NewReefPiServer constructs a ReefPiServer from the provided config.
func NewReefPiServer(cfg ServerConfig) *ReefPiServer {
	return &ReefPiServer{
		equipment:   cfg.Equipment,
		journal:     cfg.Journal,
		timer:       cfg.Timer,
		macro:       cfg.Macro,
		lighting:    cfg.Lighting,
		ato:         cfg.ATO,
		camera:      cfg.Camera,
		doser:       cfg.Doser,
		ph:          cfg.PH,
		temperature: cfg.Temperature,
		system:      cfg.System,
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

// ---- Journal ----

func toGenJournalParameter(p journalModule.Parameter) gen.JournalParameter {
	return gen.JournalParameter{
		Id:          &p.ID,
		Name:        p.Name,
		Unit:        &p.Unit,
		Description: &p.Description,
	}
}

func toGenUsageStats(stats telemetry.StatsResponse) gen.UsageStats {
	current := make([]interface{}, len(stats.Current))
	for i, m := range stats.Current {
		current[i] = m
	}
	historical := make([]interface{}, len(stats.Historical))
	for i, m := range stats.Historical {
		historical[i] = m
	}
	return gen.UsageStats{Current: &current, Historical: &historical}
}

func (s *ReefPiServer) ListJournalParameters(_ context.Context, _ gen.ListJournalParametersRequestObject) (gen.ListJournalParametersResponseObject, error) {
	if s.journal == nil {
		return gen.ListJournalParameters401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	params, err := s.journal.List()
	if err != nil {
		return gen.ListJournalParameters401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListJournalParameters200JSONResponse, len(params))
	for i, p := range params {
		resp[i] = toGenJournalParameter(p)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateJournalParameter(_ context.Context, request gen.CreateJournalParameterRequestObject) (gen.CreateJournalParameterResponseObject, error) {
	if s.journal == nil {
		return gen.CreateJournalParameter401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateJournalParameter400JSONResponse{Message: "missing request body"}, nil
	}
	b := request.Body
	param := journalModule.Parameter{Name: b.Name}
	if b.Unit != nil {
		param.Unit = *b.Unit
	}
	if b.Description != nil {
		param.Description = *b.Description
	}
	if err := s.journal.Create(param); err != nil {
		return gen.CreateJournalParameter400JSONResponse{Message: err.Error()}, nil
	}
	params, err := s.journal.List()
	if err != nil {
		return gen.CreateJournalParameter400JSONResponse{Message: err.Error()}, nil
	}
	for _, p := range params {
		if p.Name == param.Name {
			return gen.CreateJournalParameter200JSONResponse(toGenJournalParameter(p)), nil
		}
	}
	return gen.CreateJournalParameter200JSONResponse(toGenJournalParameter(param)), nil
}

func (s *ReefPiServer) GetJournalParameter(_ context.Context, request gen.GetJournalParameterRequestObject) (gen.GetJournalParameterResponseObject, error) {
	if s.journal == nil {
		return gen.GetJournalParameter401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	p, err := s.journal.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetJournalParameter404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetJournalParameter401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetJournalParameter200JSONResponse(toGenJournalParameter(p)), nil
}

func (s *ReefPiServer) UpdateJournalParameter(_ context.Context, request gen.UpdateJournalParameterRequestObject) (gen.UpdateJournalParameterResponseObject, error) {
	if s.journal == nil {
		return gen.UpdateJournalParameter401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateJournalParameter400JSONResponse{Message: "missing request body"}, nil
	}
	b := request.Body
	param := journalModule.Parameter{Name: b.Name}
	if b.Unit != nil {
		param.Unit = *b.Unit
	}
	if b.Description != nil {
		param.Description = *b.Description
	}
	if err := s.journal.Update(request.Id, param); err != nil {
		if isNotFound(err) {
			return gen.UpdateJournalParameter404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateJournalParameter400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.journal.Get(request.Id)
	if err != nil {
		return gen.UpdateJournalParameter400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateJournalParameter200JSONResponse(toGenJournalParameter(updated)), nil
}

func (s *ReefPiServer) DeleteJournalParameter(_ context.Context, request gen.DeleteJournalParameterRequestObject) (gen.DeleteJournalParameterResponseObject, error) {
	if s.journal == nil {
		return gen.DeleteJournalParameter401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	if err := s.journal.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteJournalParameter404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteJournalParameter401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteJournalParameter200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) RecordJournalEntry(_ context.Context, request gen.RecordJournalEntryRequestObject) (gen.RecordJournalEntryResponseObject, error) {
	if s.journal == nil {
		return gen.RecordJournalEntry401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.RecordJournalEntry400JSONResponse{Message: "missing request body"}, nil
	}
	entry := journalModule.Entry{Value: request.Body.Value}
	if request.Body.Comment != nil {
		entry.Comment = *request.Body.Comment
	}
	if err := s.journal.AddEntry(request.Id, entry); err != nil {
		if isNotFound(err) {
			return gen.RecordJournalEntry404JSONResponse{Message: err.Error()}, nil
		}
		return gen.RecordJournalEntry400JSONResponse{Message: err.Error()}, nil
	}
	return gen.RecordJournalEntry200JSONResponse{Message: "recorded"}, nil
}

func (s *ReefPiServer) GetJournalUsage(_ context.Context, request gen.GetJournalUsageRequestObject) (gen.GetJournalUsageResponseObject, error) {
	if s.journal == nil {
		return gen.GetJournalUsage401JSONResponse{Message: "journal subsystem not loaded"}, nil
	}
	stats, err := s.journal.Usage(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetJournalUsage404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetJournalUsage401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetJournalUsage200JSONResponse(toGenUsageStats(stats)), nil
}

// ---- Macro ----

func (s *ReefPiServer) ListMacros(_ context.Context, _ gen.ListMacrosRequestObject) (gen.ListMacrosResponseObject, error) {
	if s.macro == nil {
		return gen.ListMacros401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	macros, err := s.macro.List()
	if err != nil {
		return gen.ListMacros401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListMacros200JSONResponse, len(macros))
	for i, m := range macros {
		resp[i] = toGenMacro(m)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateMacro(_ context.Context, request gen.CreateMacroRequestObject) (gen.CreateMacroResponseObject, error) {
	if s.macro == nil {
		return gen.CreateMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateMacro400JSONResponse{Message: "missing request body"}, nil
	}
	m := macroModule.Macro{Name: request.Body.Name}
	if request.Body.Reversible != nil {
		m.Reversible = *request.Body.Reversible
	}
	if err := s.macro.Create(m); err != nil {
		return gen.CreateMacro400JSONResponse{Message: err.Error()}, nil
	}
	macros, err := s.macro.List()
	if err != nil {
		return gen.CreateMacro400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range macros {
		if found.Name == m.Name {
			return gen.CreateMacro200JSONResponse(toGenMacro(found)), nil
		}
	}
	return gen.CreateMacro200JSONResponse(toGenMacro(m)), nil
}

func (s *ReefPiServer) GetMacro(_ context.Context, request gen.GetMacroRequestObject) (gen.GetMacroResponseObject, error) {
	if s.macro == nil {
		return gen.GetMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	m, err := s.macro.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetMacro401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetMacro200JSONResponse(toGenMacro(m)), nil
}

func (s *ReefPiServer) UpdateMacro(_ context.Context, request gen.UpdateMacroRequestObject) (gen.UpdateMacroResponseObject, error) {
	if s.macro == nil {
		return gen.UpdateMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateMacro400JSONResponse{Message: "missing request body"}, nil
	}
	existing, err := s.macro.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.UpdateMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateMacro401JSONResponse{Message: err.Error()}, nil
	}
	existing.Name = request.Body.Name
	if request.Body.Reversible != nil {
		existing.Reversible = *request.Body.Reversible
	}
	if err := s.macro.Update(request.Id, existing); err != nil {
		if isNotFound(err) {
			return gen.UpdateMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateMacro400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.macro.Get(request.Id)
	if err != nil {
		return gen.UpdateMacro400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateMacro200JSONResponse(toGenMacro(updated)), nil
}

func (s *ReefPiServer) DeleteMacro(_ context.Context, request gen.DeleteMacroRequestObject) (gen.DeleteMacroResponseObject, error) {
	if s.macro == nil {
		return gen.DeleteMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	if err := s.macro.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteMacro401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteMacro200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) RunMacro(_ context.Context, request gen.RunMacroRequestObject) (gen.RunMacroResponseObject, error) {
	if s.macro == nil {
		return gen.RunMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	m, err := s.macro.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.RunMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.RunMacro401JSONResponse{Message: err.Error()}, nil
	}
	if err := s.macro.Run(m, false); err != nil {
		return gen.RunMacro401JSONResponse{Message: err.Error()}, nil
	}
	return gen.RunMacro200JSONResponse{Message: "ok"}, nil
}

func (s *ReefPiServer) RevertMacro(_ context.Context, request gen.RevertMacroRequestObject) (gen.RevertMacroResponseObject, error) {
	if s.macro == nil {
		return gen.RevertMacro401JSONResponse{Message: "macro subsystem not loaded"}, nil
	}
	m, err := s.macro.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.RevertMacro404JSONResponse{Message: err.Error()}, nil
		}
		return gen.RevertMacro401JSONResponse{Message: err.Error()}, nil
	}
	if err := s.macro.Run(m, true); err != nil {
		return gen.RevertMacro401JSONResponse{Message: err.Error()}, nil
	}
	return gen.RevertMacro200JSONResponse{Message: "ok"}, nil
}

func toGenMacro(m macroModule.Macro) gen.Macro {
	rev := m.Reversible
	return gen.Macro{
		Id:         &m.ID,
		Name:       m.Name,
		Reversible: &rev,
	}
}

// ---- Lighting ----

func (s *ReefPiServer) ListLights(_ context.Context, _ gen.ListLightsRequestObject) (gen.ListLightsResponseObject, error) {
	if s.lighting == nil {
		return gen.ListLights401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	lights, err := s.lighting.List()
	if err != nil {
		return gen.ListLights401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListLights200JSONResponse, len(lights))
	for i, l := range lights {
		resp[i] = toGenLight(l)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateLight(_ context.Context, request gen.CreateLightRequestObject) (gen.CreateLightResponseObject, error) {
	if s.lighting == nil {
		return gen.CreateLight401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateLight400JSONResponse{Message: "missing request body"}, nil
	}
	l := lightingModule.Light{Name: request.Body.Name}
	if err := s.lighting.Create(l); err != nil {
		return gen.CreateLight400JSONResponse{Message: err.Error()}, nil
	}
	lights, err := s.lighting.List()
	if err != nil {
		return gen.CreateLight400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range lights {
		if found.Name == l.Name {
			return gen.CreateLight200JSONResponse(toGenLight(found)), nil
		}
	}
	return gen.CreateLight200JSONResponse(toGenLight(l)), nil
}

func (s *ReefPiServer) GetLight(_ context.Context, request gen.GetLightRequestObject) (gen.GetLightResponseObject, error) {
	if s.lighting == nil {
		return gen.GetLight401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	l, err := s.lighting.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetLight404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetLight401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetLight200JSONResponse(toGenLight(l)), nil
}

func (s *ReefPiServer) UpdateLight(_ context.Context, request gen.UpdateLightRequestObject) (gen.UpdateLightResponseObject, error) {
	if s.lighting == nil {
		return gen.UpdateLight401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateLight400JSONResponse{Message: "missing request body"}, nil
	}
	existing, err := s.lighting.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.UpdateLight404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateLight401JSONResponse{Message: err.Error()}, nil
	}
	existing.Name = request.Body.Name
	if err := s.lighting.Update(request.Id, existing); err != nil {
		if isNotFound(err) {
			return gen.UpdateLight404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateLight400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.lighting.Get(request.Id)
	if err != nil {
		return gen.UpdateLight400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateLight200JSONResponse(toGenLight(updated)), nil
}

func (s *ReefPiServer) DeleteLight(_ context.Context, request gen.DeleteLightRequestObject) (gen.DeleteLightResponseObject, error) {
	if s.lighting == nil {
		return gen.DeleteLight401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	if err := s.lighting.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteLight404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteLight401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteLight200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) GetLightUsage(_ context.Context, request gen.GetLightUsageRequestObject) (gen.GetLightUsageResponseObject, error) {
	if s.lighting == nil {
		return gen.GetLightUsage401JSONResponse{Message: "lighting subsystem not loaded"}, nil
	}
	stats, err := s.lighting.Usage(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetLightUsage404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetLightUsage401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetLightUsage200JSONResponse(toGenUsageStats(stats)), nil
}

func toGenLight(l lightingModule.Light) gen.Light {
	return gen.Light{Id: &l.ID, Name: l.Name}
}

// ---- ATO ----

func (s *ReefPiServer) ListATOs(_ context.Context, _ gen.ListATOsRequestObject) (gen.ListATOsResponseObject, error) {
	if s.ato == nil {
		return gen.ListATOs401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	atos, err := s.ato.List()
	if err != nil {
		return gen.ListATOs401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListATOs200JSONResponse, len(atos))
	for i, a := range atos {
		resp[i] = toGenATO(a)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateATO(_ context.Context, request gen.CreateATORequestObject) (gen.CreateATOResponseObject, error) {
	if s.ato == nil {
		return gen.CreateATO401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateATO400JSONResponse{Message: "missing request body"}, nil
	}
	a := fromGenATO(*request.Body)
	if err := s.ato.Create(a); err != nil {
		return gen.CreateATO400JSONResponse{Message: err.Error()}, nil
	}
	atos, err := s.ato.List()
	if err != nil {
		return gen.CreateATO400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range atos {
		if found.Name == a.Name {
			return gen.CreateATO200JSONResponse(toGenATO(found)), nil
		}
	}
	return gen.CreateATO200JSONResponse(toGenATO(a)), nil
}

func (s *ReefPiServer) GetATO(_ context.Context, request gen.GetATORequestObject) (gen.GetATOResponseObject, error) {
	if s.ato == nil {
		return gen.GetATO401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	a, err := s.ato.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetATO404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetATO401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetATO200JSONResponse(toGenATO(a)), nil
}

func (s *ReefPiServer) UpdateATO(_ context.Context, request gen.UpdateATORequestObject) (gen.UpdateATOResponseObject, error) {
	if s.ato == nil {
		return gen.UpdateATO401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateATO400JSONResponse{Message: "missing request body"}, nil
	}
	a := fromGenATO(*request.Body)
	if err := s.ato.Update(request.Id, a); err != nil {
		if isNotFound(err) {
			return gen.UpdateATO404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateATO400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.ato.Get(request.Id)
	if err != nil {
		return gen.UpdateATO400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateATO200JSONResponse(toGenATO(updated)), nil
}

func (s *ReefPiServer) DeleteATO(_ context.Context, request gen.DeleteATORequestObject) (gen.DeleteATOResponseObject, error) {
	if s.ato == nil {
		return gen.DeleteATO401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	if err := s.ato.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteATO404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteATO401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteATO200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ResetATO(_ context.Context, request gen.ResetATORequestObject) (gen.ResetATOResponseObject, error) {
	if s.ato == nil {
		return gen.ResetATO401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	if err := s.ato.Reset(request.Id); err != nil {
		if isNotFound(err) {
			return gen.ResetATO404JSONResponse{Message: err.Error()}, nil
		}
		return gen.ResetATO401JSONResponse{Message: err.Error()}, nil
	}
	return gen.ResetATO200JSONResponse{Message: "reset"}, nil
}

func (s *ReefPiServer) GetATOUsage(_ context.Context, request gen.GetATOUsageRequestObject) (gen.GetATOUsageResponseObject, error) {
	if s.ato == nil {
		return gen.GetATOUsage401JSONResponse{Message: "ato subsystem not loaded"}, nil
	}
	stats, err := s.ato.Usage(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetATOUsage404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetATOUsage401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetATOUsage200JSONResponse(toGenUsageStats(stats)), nil
}

func toGenATO(a atoModule.ATO) gen.ATO {
	enable := a.Enable
	control := a.Control
	return gen.ATO{
		Id:      &a.ID,
		Name:    a.Name,
		Inlet:   &a.Inlet,
		Pump:    &a.Pump,
		Enable:  &enable,
		Control: &control,
	}
}

func fromGenATO(a gen.ATO) atoModule.ATO {
	out := atoModule.ATO{Name: a.Name}
	if a.Inlet != nil {
		out.Inlet = *a.Inlet
	}
	if a.Pump != nil {
		out.Pump = *a.Pump
	}
	if a.Enable != nil {
		out.Enable = *a.Enable
	}
	if a.Control != nil {
		out.Control = *a.Control
	}
	return out
}

// ---- Camera ----

func (s *ReefPiServer) GetCameraConfig(_ context.Context, _ gen.GetCameraConfigRequestObject) (gen.GetCameraConfigResponseObject, error) {
	if s.camera == nil {
		return gen.GetCameraConfig401JSONResponse{Message: "camera subsystem not loaded"}, nil
	}
	conf := s.camera.GetConfig()
	return gen.GetCameraConfig200JSONResponse(toGenCameraConfig(conf)), nil
}

func (s *ReefPiServer) UpdateCameraConfig(_ context.Context, request gen.UpdateCameraConfigRequestObject) (gen.UpdateCameraConfigResponseObject, error) {
	if s.camera == nil {
		return gen.UpdateCameraConfig401JSONResponse{Message: "camera subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateCameraConfig400JSONResponse{Message: "missing request body"}, nil
	}
	conf := fromGenCameraConfig(*request.Body)
	if err := s.camera.SaveConfig(conf); err != nil {
		return gen.UpdateCameraConfig400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateCameraConfig200JSONResponse(toGenCameraConfig(conf)), nil
}

func (s *ReefPiServer) GetCameraLatest(_ context.Context, _ gen.GetCameraLatestRequestObject) (gen.GetCameraLatestResponseObject, error) {
	if s.camera == nil {
		return gen.GetCameraLatest401JSONResponse{Message: "camera subsystem not loaded"}, nil
	}
	data, err := s.camera.GetLatest()
	if err != nil {
		return gen.GetCameraLatest401JSONResponse{Message: err.Error()}, nil
	}
	img := data["image"]
	return gen.GetCameraLatest200JSONResponse{Message: img}, nil
}

func (s *ReefPiServer) ListCameraImages(_ context.Context, _ gen.ListCameraImagesRequestObject) (gen.ListCameraImagesResponseObject, error) {
	if s.camera == nil {
		return gen.ListCameraImages401JSONResponse{Message: "camera subsystem not loaded"}, nil
	}
	items, err := s.camera.ListImages()
	if err != nil {
		return gen.ListCameraImages401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListCameraImages200JSONResponse, len(items))
	for i, item := range items {
		resp[i] = item.Name
	}
	return resp, nil
}

func (s *ReefPiServer) CameraShoot(_ context.Context, _ gen.CameraShootRequestObject) (gen.CameraShootResponseObject, error) {
	if s.camera == nil {
		return gen.CameraShoot401JSONResponse{Message: "camera subsystem not loaded"}, nil
	}
	imgPath, err := s.camera.Capture()
	if err != nil {
		return gen.CameraShoot401JSONResponse{Message: err.Error()}, nil
	}
	return gen.CameraShoot200JSONResponse{Message: imgPath}, nil
}

func toGenCameraConfig(c cameraModule.Config) gen.CameraConfig {
	enable := c.Enable
	return gen.CameraConfig{Enable: &enable, ImageDirectory: &c.ImageDirectory}
}

func fromGenCameraConfig(c gen.CameraConfig) cameraModule.Config {
	conf := cameraModule.Config{
		ImageDirectory: "/var/lib/reef-pi/images",
		TickInterval:   120,
	}
	if c.Enable != nil {
		conf.Enable = *c.Enable
	}
	if c.ImageDirectory != nil {
		conf.ImageDirectory = *c.ImageDirectory
	}
	return conf
}

// ---- Doser ----

func (s *ReefPiServer) ListDoserPumps(_ context.Context, _ gen.ListDoserPumpsRequestObject) (gen.ListDoserPumpsResponseObject, error) {
	if s.doser == nil {
		return gen.ListDoserPumps401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	pumps, err := s.doser.List()
	if err != nil {
		return gen.ListDoserPumps401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListDoserPumps200JSONResponse, len(pumps))
	for i, p := range pumps {
		resp[i] = toGenPump(p)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateDoserPump(_ context.Context, request gen.CreateDoserPumpRequestObject) (gen.CreateDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.CreateDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateDoserPump400JSONResponse{Message: "missing request body"}, nil
	}
	p := fromGenPump(*request.Body)
	if err := s.doser.Create(p); err != nil {
		return gen.CreateDoserPump400JSONResponse{Message: err.Error()}, nil
	}
	pumps, err := s.doser.List()
	if err != nil {
		return gen.CreateDoserPump400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range pumps {
		if found.Name == p.Name {
			return gen.CreateDoserPump200JSONResponse(toGenPump(found)), nil
		}
	}
	return gen.CreateDoserPump200JSONResponse(toGenPump(p)), nil
}

func (s *ReefPiServer) GetDoserPump(_ context.Context, request gen.GetDoserPumpRequestObject) (gen.GetDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.GetDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	p, err := s.doser.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetDoserPump404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetDoserPump401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetDoserPump200JSONResponse(toGenPump(p)), nil
}

func (s *ReefPiServer) UpdateDoserPump(_ context.Context, request gen.UpdateDoserPumpRequestObject) (gen.UpdateDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.UpdateDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateDoserPump400JSONResponse{Message: "missing request body"}, nil
	}
	p := fromGenPump(*request.Body)
	if err := s.doser.Update(request.Id, p); err != nil {
		if isNotFound(err) {
			return gen.UpdateDoserPump404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateDoserPump400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.doser.Get(request.Id)
	if err != nil {
		return gen.UpdateDoserPump400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateDoserPump200JSONResponse(toGenPump(updated)), nil
}

func (s *ReefPiServer) DeleteDoserPump(_ context.Context, request gen.DeleteDoserPumpRequestObject) (gen.DeleteDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.DeleteDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	if err := s.doser.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteDoserPump404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteDoserPump401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteDoserPump200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) CalibrateDoserPump(_ context.Context, request gen.CalibrateDoserPumpRequestObject) (gen.CalibrateDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.CalibrateDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	cal := doserModule.CalibrationDetails{}
	if err := s.doser.Calibrate(request.Id, cal); err != nil {
		return gen.CalibrateDoserPump401JSONResponse{Message: err.Error()}, nil
	}
	return gen.CalibrateDoserPump200JSONResponse{Message: "calibrating"}, nil
}

func (s *ReefPiServer) SaveDoserPumpCalibration(_ context.Context, request gen.SaveDoserPumpCalibrationRequestObject) (gen.SaveDoserPumpCalibrationResponseObject, error) {
	if s.doser == nil {
		return gen.SaveDoserPumpCalibration401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	cal := doserModule.CalibrationDetails{}
	if request.Body != nil && request.Body.Duration != nil {
		cal.Duration = float64(*request.Body.Duration)
	}
	if request.Body != nil && request.Body.Volume != nil {
		cal.Volume = *request.Body.Volume
	}
	s.doser.SaveCalibrationResult(request.Id, cal)
	return gen.SaveDoserPumpCalibration200JSONResponse{Message: "saved"}, nil
}

func (s *ReefPiServer) ScheduleDoserPump(_ context.Context, request gen.ScheduleDoserPumpRequestObject) (gen.ScheduleDoserPumpResponseObject, error) {
	if s.doser == nil {
		return gen.ScheduleDoserPump401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.ScheduleDoserPump400JSONResponse{Message: "missing request body"}, nil
	}
	reg := doserModule.DosingRegiment{}
	if request.Body.Duration != nil {
		reg.Duration = float64(*request.Body.Duration)
	}
	if err := s.doser.Schedule(request.Id, reg); err != nil {
		return gen.ScheduleDoserPump400JSONResponse{Message: err.Error()}, nil
	}
	return gen.ScheduleDoserPump200JSONResponse{Message: "scheduled"}, nil
}

func (s *ReefPiServer) GetDoserPumpUsage(_ context.Context, request gen.GetDoserPumpUsageRequestObject) (gen.GetDoserPumpUsageResponseObject, error) {
	if s.doser == nil {
		return gen.GetDoserPumpUsage401JSONResponse{Message: "doser subsystem not loaded"}, nil
	}
	stats, err := s.doser.Usage(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetDoserPumpUsage404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetDoserPumpUsage401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetDoserPumpUsage200JSONResponse(toGenUsageStats(stats)), nil
}

func toGenPump(p doserModule.Pump) gen.DoserPump {
	return gen.DoserPump{Id: &p.ID, Name: p.Name, Jack: &p.Jack, Pin: &p.Pin}
}

func fromGenPump(p gen.DoserPump) doserModule.Pump {
	out := doserModule.Pump{Name: p.Name}
	if p.Jack != nil {
		out.Jack = *p.Jack
	}
	if p.Pin != nil {
		out.Pin = *p.Pin
	}
	return out
}

// ---- PH ----

func (s *ReefPiServer) ListPhProbes(_ context.Context, _ gen.ListPhProbesRequestObject) (gen.ListPhProbesResponseObject, error) {
	if s.ph == nil {
		return gen.ListPhProbes401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	probes, err := s.ph.List()
	if err != nil {
		return gen.ListPhProbes401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListPhProbes200JSONResponse, len(probes))
	for i, p := range probes {
		resp[i] = toGenPhProbe(p)
	}
	return resp, nil
}

func (s *ReefPiServer) CreatePhProbe(_ context.Context, request gen.CreatePhProbeRequestObject) (gen.CreatePhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.CreatePhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreatePhProbe400JSONResponse{Message: "missing request body"}, nil
	}
	p := phModule.Probe{Name: request.Body.Name}
	if err := s.ph.Create(p); err != nil {
		return gen.CreatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	probes, err := s.ph.List()
	if err != nil {
		return gen.CreatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range probes {
		if found.Name == p.Name {
			return gen.CreatePhProbe200JSONResponse(toGenPhProbe(found)), nil
		}
	}
	return gen.CreatePhProbe200JSONResponse(toGenPhProbe(p)), nil
}

func (s *ReefPiServer) GetPhProbe(_ context.Context, request gen.GetPhProbeRequestObject) (gen.GetPhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.GetPhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	p, err := s.ph.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetPhProbe404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetPhProbe401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetPhProbe200JSONResponse(toGenPhProbe(p)), nil
}

func (s *ReefPiServer) UpdatePhProbe(_ context.Context, request gen.UpdatePhProbeRequestObject) (gen.UpdatePhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.UpdatePhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdatePhProbe400JSONResponse{Message: "missing request body"}, nil
	}
	existing, err := s.ph.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.UpdatePhProbe404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdatePhProbe401JSONResponse{Message: err.Error()}, nil
	}
	existing.Name = request.Body.Name
	if err := s.ph.Update(request.Id, existing); err != nil {
		if isNotFound(err) {
			return gen.UpdatePhProbe404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.ph.Get(request.Id)
	if err != nil {
		return gen.UpdatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdatePhProbe200JSONResponse(toGenPhProbe(updated)), nil
}

func (s *ReefPiServer) DeletePhProbe(_ context.Context, request gen.DeletePhProbeRequestObject) (gen.DeletePhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.DeletePhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	if err := s.ph.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeletePhProbe404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeletePhProbe401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeletePhProbe200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) CalibratePhProbe(_ context.Context, request gen.CalibratePhProbeRequestObject) (gen.CalibratePhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.CalibratePhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	var ms []hal.Measurement
	if request.Body != nil {
		ms = []hal.Measurement{{Expected: request.Body.Expected, Observed: request.Body.Observed}}
	}
	if err := s.ph.Calibrate(request.Id, ms); err != nil {
		return gen.CalibratePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CalibratePhProbe200JSONResponse{Message: "calibrated"}, nil
}

func (s *ReefPiServer) CalibratePhProbePoint(_ context.Context, request gen.CalibratePhProbePointRequestObject) (gen.CalibratePhProbePointResponseObject, error) {
	if s.ph == nil {
		return gen.CalibratePhProbePoint401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CalibratePhProbePoint400JSONResponse{Message: "missing request body"}, nil
	}
	point := phModule.CalibrationPoint{Expected: request.Body.Expected, Observed: request.Body.Observed}
	if err := s.ph.CalibratePoint(request.Id, point); err != nil {
		return gen.CalibratePhProbePoint400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CalibratePhProbePoint200JSONResponse{Message: "ok"}, nil
}

func (s *ReefPiServer) ReadPhProbe(_ context.Context, request gen.ReadPhProbeRequestObject) (gen.ReadPhProbeResponseObject, error) {
	if s.ph == nil {
		return gen.ReadPhProbe401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	probe, err := s.ph.Get(request.Id)
	if err != nil {
		return gen.ReadPhProbe401JSONResponse{Message: err.Error()}, nil
	}
	reading, err := s.ph.Read(probe)
	if err != nil {
		return gen.ReadPhProbe401JSONResponse{Message: err.Error()}, nil
	}
	return gen.ReadPhProbe200JSONResponse{Value: &reading}, nil
}

func (s *ReefPiServer) GetPhReadings(_ context.Context, request gen.GetPhReadingsRequestObject) (gen.GetPhReadingsResponseObject, error) {
	if s.ph == nil {
		return gen.GetPhReadings401JSONResponse{Message: "ph subsystem not loaded"}, nil
	}
	stats, err := s.ph.Readings(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetPhReadings404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetPhReadings401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetPhReadings200JSONResponse(toGenUsageStats(stats)), nil
}

func toGenPhProbe(p phModule.Probe) gen.PhProbe {
	return gen.PhProbe{Id: &p.ID, Name: p.Name}
}

// ---- Temperature ----

func (s *ReefPiServer) ListTemperatureControllers(_ context.Context, _ gen.ListTemperatureControllersRequestObject) (gen.ListTemperatureControllersResponseObject, error) {
	if s.temperature == nil {
		return gen.ListTemperatureControllers401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	tcs, err := s.temperature.List()
	if err != nil {
		return gen.ListTemperatureControllers401JSONResponse{Message: err.Error()}, nil
	}
	resp := make(gen.ListTemperatureControllers200JSONResponse, len(tcs))
	for i, tc := range tcs {
		resp[i] = toGenTC(*tc)
	}
	return resp, nil
}

func (s *ReefPiServer) CreateTemperatureController(_ context.Context, request gen.CreateTemperatureControllerRequestObject) (gen.CreateTemperatureControllerResponseObject, error) {
	if s.temperature == nil {
		return gen.CreateTemperatureController401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.CreateTemperatureController400JSONResponse{Message: "missing request body"}, nil
	}
	tc := temperatureModule.TC{Name: request.Body.Name}
	if err := s.temperature.Create(&tc); err != nil {
		return gen.CreateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	tcs, err := s.temperature.List()
	if err != nil {
		return gen.CreateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range tcs {
		if found.Name == tc.Name {
			return gen.CreateTemperatureController200JSONResponse(toGenTC(*found)), nil
		}
	}
	return gen.CreateTemperatureController200JSONResponse(toGenTC(tc)), nil
}

func (s *ReefPiServer) GetTemperatureController(_ context.Context, request gen.GetTemperatureControllerRequestObject) (gen.GetTemperatureControllerResponseObject, error) {
	if s.temperature == nil {
		return gen.GetTemperatureController401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	tc, err := s.temperature.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetTemperatureController404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetTemperatureController401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetTemperatureController200JSONResponse(toGenTC(*tc)), nil
}

func (s *ReefPiServer) UpdateTemperatureController(_ context.Context, request gen.UpdateTemperatureControllerRequestObject) (gen.UpdateTemperatureControllerResponseObject, error) {
	if s.temperature == nil {
		return gen.UpdateTemperatureController401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	if request.Body == nil {
		return gen.UpdateTemperatureController400JSONResponse{Message: "missing request body"}, nil
	}
	existing, err := s.temperature.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.UpdateTemperatureController404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateTemperatureController401JSONResponse{Message: err.Error()}, nil
	}
	existing.Name = request.Body.Name
	if err := s.temperature.Update(request.Id, existing); err != nil {
		if isNotFound(err) {
			return gen.UpdateTemperatureController404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	updated, err := s.temperature.Get(request.Id)
	if err != nil {
		return gen.UpdateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateTemperatureController200JSONResponse(toGenTC(*updated)), nil
}

func (s *ReefPiServer) DeleteTemperatureController(_ context.Context, request gen.DeleteTemperatureControllerRequestObject) (gen.DeleteTemperatureControllerResponseObject, error) {
	if s.temperature == nil {
		return gen.DeleteTemperatureController401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	if err := s.temperature.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteTemperatureController404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteTemperatureController401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteTemperatureController200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ListTemperatureSensors(_ context.Context, _ gen.ListTemperatureSensorsRequestObject) (gen.ListTemperatureSensorsResponseObject, error) {
	if s.temperature == nil {
		return gen.ListTemperatureSensors401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	return gen.ListTemperatureSensors200JSONResponse{}, nil
}

func (s *ReefPiServer) GetCurrentTemperature(_ context.Context, request gen.GetCurrentTemperatureRequestObject) (gen.GetCurrentTemperatureResponseObject, error) {
	if s.temperature == nil {
		return gen.GetCurrentTemperature401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	v, err := s.temperature.CurrentReading(request.Id)
	if err != nil {
		return gen.GetCurrentTemperature401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetCurrentTemperature200JSONResponse{Value: &v}, nil
}

func (s *ReefPiServer) ReadTemperatureSensor(_ context.Context, request gen.ReadTemperatureSensorRequestObject) (gen.ReadTemperatureSensorResponseObject, error) {
	if s.temperature == nil {
		return gen.ReadTemperatureSensor401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	tc, err := s.temperature.Get(request.Id)
	if err != nil {
		return gen.ReadTemperatureSensor401JSONResponse{Message: err.Error()}, nil
	}
	v, err := s.temperature.Read(tc)
	if err != nil {
		return gen.ReadTemperatureSensor401JSONResponse{Message: err.Error()}, nil
	}
	return gen.ReadTemperatureSensor200JSONResponse{Value: &v}, nil
}

func (s *ReefPiServer) CalibrateTemperatureSensor(_ context.Context, request gen.CalibrateTemperatureSensorRequestObject) (gen.CalibrateTemperatureSensorResponseObject, error) {
	if s.temperature == nil {
		return gen.CalibrateTemperatureSensor401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	var ms []hal.Measurement
	if request.Body != nil && request.Body.Expected != nil {
		ms = []hal.Measurement{{Expected: *request.Body.Expected}}
	}
	if err := s.temperature.Calibrate(request.Id, ms); err != nil {
		return gen.CalibrateTemperatureSensor401JSONResponse{Message: err.Error()}, nil
	}
	return gen.CalibrateTemperatureSensor200JSONResponse{Message: "calibrated"}, nil
}

func (s *ReefPiServer) GetTemperatureUsage(_ context.Context, request gen.GetTemperatureUsageRequestObject) (gen.GetTemperatureUsageResponseObject, error) {
	if s.temperature == nil {
		return gen.GetTemperatureUsage401JSONResponse{Message: "temperature subsystem not loaded"}, nil
	}
	stats, err := s.temperature.Usage(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetTemperatureUsage404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetTemperatureUsage401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetTemperatureUsage200JSONResponse(toGenUsageStats(stats)), nil
}

func toGenTC(tc temperatureModule.TC) gen.TemperatureController {
	return gen.TemperatureController{Id: &tc.ID, Name: tc.Name}
}

// ---- System ----

func (s *ReefPiServer) SystemPoweroff(_ context.Context, _ gen.SystemPoweroffRequestObject) (gen.SystemPoweroffResponseObject, error) {
	if s.system == nil {
		return gen.SystemPoweroff401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	s.system.SystemPoweroff()
	return gen.SystemPoweroff200JSONResponse{Message: "shutting down"}, nil
}

func (s *ReefPiServer) SystemReboot(_ context.Context, _ gen.SystemRebootRequestObject) (gen.SystemRebootResponseObject, error) {
	if s.system == nil {
		return gen.SystemReboot401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	s.system.SystemReboot()
	return gen.SystemReboot200JSONResponse{Message: "rebooting"}, nil
}

func (s *ReefPiServer) SystemReload(_ context.Context, _ gen.SystemReloadRequestObject) (gen.SystemReloadResponseObject, error) {
	if s.system == nil {
		return gen.SystemReload401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	if err := s.system.SystemReload(); err != nil {
		return gen.SystemReload401JSONResponse{Message: err.Error()}, nil
	}
	return gen.SystemReload200JSONResponse{Message: "reloaded"}, nil
}

func (s *ReefPiServer) SystemUpgrade(_ context.Context, _ gen.SystemUpgradeRequestObject) (gen.SystemUpgradeResponseObject, error) {
	if s.system == nil {
		return gen.SystemUpgrade401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	if err := s.system.SystemUpgrade(""); err != nil {
		return gen.SystemUpgrade401JSONResponse{Message: err.Error()}, nil
	}
	return gen.SystemUpgrade200JSONResponse{Message: "upgrading"}, nil
}

func (s *ReefPiServer) GetDisplayState(_ context.Context, _ gen.GetDisplayStateRequestObject) (gen.GetDisplayStateResponseObject, error) {
	if s.system == nil {
		return gen.GetDisplayState401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	state, err := s.system.CurrentDisplayState()
	if err != nil {
		return gen.GetDisplayState401JSONResponse{Message: err.Error()}, nil
	}
	on := state.On
	b := state.Brightness
	return gen.GetDisplayState200JSONResponse{On: &on, Brightness: &b}, nil
}

func (s *ReefPiServer) SetDisplayBrightness(_ context.Context, request gen.SetDisplayBrightnessRequestObject) (gen.SetDisplayBrightnessResponseObject, error) {
	if s.system == nil {
		return gen.SetDisplayBrightness401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	var brightness int
	if request.Body != nil && request.Body.Brightness != nil {
		brightness = *request.Body.Brightness
	}
	if err := s.system.SetBrightnessPublic(brightness); err != nil {
		return gen.SetDisplayBrightness401JSONResponse{Message: err.Error()}, nil
	}
	return gen.SetDisplayBrightness200JSONResponse{Message: "ok"}, nil
}

func (s *ReefPiServer) EnableDisplay(_ context.Context, _ gen.EnableDisplayRequestObject) (gen.EnableDisplayResponseObject, error) {
	if s.system == nil {
		return gen.EnableDisplay401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	if err := s.system.EnableDisplayPublic(); err != nil {
		return gen.EnableDisplay401JSONResponse{Message: err.Error()}, nil
	}
	return gen.EnableDisplay200JSONResponse{Message: "enabled"}, nil
}

func (s *ReefPiServer) DisableDisplay(_ context.Context, _ gen.DisableDisplayRequestObject) (gen.DisableDisplayResponseObject, error) {
	if s.system == nil {
		return gen.DisableDisplay401JSONResponse{Message: "system subsystem not loaded"}, nil
	}
	if err := s.system.DisableDisplayPublic(); err != nil {
		return gen.DisableDisplay401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DisableDisplay200JSONResponse{Message: "disabled"}, nil
}
