package api

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"github.com/reef-pi/hal"

	"github.com/reef-pi/reef-pi/controller/api/gen"
	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
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
	Equipment    *equipmentModule.Controller
	Journal      *journalModule.Subsystem
	Timer        *timerModule.Controller
	Macro        *macroModule.Subsystem
	Lighting     *lightingModule.Controller
	ATO          *atoModule.Controller
	Camera       *cameraModule.Controller
	Doser        *doserModule.Controller
	PH           *phModule.Controller
	Temperature  *temperatureModule.Controller
	System       *systemModule.Controller
	Drivers      *drivers.Drivers
	Outlets      *connectors.Outlets
	Inlets       *connectors.Inlets
	Jacks        *connectors.Jacks
	AnalogInputs *connectors.AnalogInputs
}

// ReefPiServer implements gen.StrictServerInterface for all migrated modules.
type ReefPiServer struct {
	equipment    *equipmentModule.Controller
	journal      *journalModule.Subsystem
	timer        *timerModule.Controller
	macro        *macroModule.Subsystem
	lighting     *lightingModule.Controller
	ato          *atoModule.Controller
	camera       *cameraModule.Controller
	doser        *doserModule.Controller
	ph           *phModule.Controller
	temperature  *temperatureModule.Controller
	system       *systemModule.Controller
	drivers      *drivers.Drivers
	outlets      *connectors.Outlets
	inlets       *connectors.Inlets
	jacks        *connectors.Jacks
	analogInputs *connectors.AnalogInputs
}

// NewReefPiServer constructs a ReefPiServer from the provided config.
func NewReefPiServer(cfg ServerConfig) *ReefPiServer {
	return &ReefPiServer{
		equipment:    cfg.Equipment,
		journal:      cfg.Journal,
		timer:        cfg.Timer,
		macro:        cfg.Macro,
		lighting:     cfg.Lighting,
		ato:          cfg.ATO,
		camera:       cfg.Camera,
		doser:        cfg.Doser,
		ph:           cfg.PH,
		temperature:  cfg.Temperature,
		system:       cfg.System,
		drivers:      cfg.Drivers,
		outlets:      cfg.Outlets,
		inlets:       cfg.Inlets,
		jacks:        cfg.Jacks,
		analogInputs: cfg.AnalogInputs,
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
	var out gen.Macro
	raw, _ := json.Marshal(m)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &m.ID
	return out
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
	l := fromGenLight(*request.Body)
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
	updated := fromGenLight(*request.Body)
	updated.ID = existing.ID
	if updated.Channels == nil {
		updated.Channels = existing.Channels
	}
	if err := s.lighting.Update(request.Id, updated); err != nil {
		if isNotFound(err) {
			return gen.UpdateLight404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateLight400JSONResponse{Message: err.Error()}, nil
	}
	result, err := s.lighting.Get(request.Id)
	if err != nil {
		return gen.UpdateLight400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateLight200JSONResponse(toGenLight(result)), nil
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
	var out gen.Light
	raw, _ := json.Marshal(l)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &l.ID
	return out
}

func fromGenLight(g gen.Light) lightingModule.Light {
	l := lightingModule.Light{Name: g.Name}
	if g.Jack != nil {
		l.Jack = *g.Jack
	}
	if g.Enable != nil {
		l.Enable = *g.Enable
	}
	if g.Channels != nil {
		raw, _ := json.Marshal(g.Channels)
		var ch map[int]*lightingModule.Channel
		if json.Unmarshal(raw, &ch) == nil {
			l.Channels = ch
		}
	}
	return l
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
	var out gen.ATO
	raw, _ := json.Marshal(a)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &a.ID
	return out
}

func fromGenATO(a gen.ATO) atoModule.ATO {
	var out atoModule.ATO
	raw, _ := json.Marshal(a)
	json.Unmarshal(raw, &out) //nolint:errcheck
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
	var out gen.DoserPump
	raw, _ := json.Marshal(p)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &p.ID
	return out
}

func fromGenPump(p gen.DoserPump) doserModule.Pump {
	var out doserModule.Pump
	raw, _ := json.Marshal(p)
	json.Unmarshal(raw, &out) //nolint:errcheck
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
	p := fromGenPhProbe(*request.Body)
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
	probe := fromGenPhProbe(*request.Body)
	probe.ID = existing.ID
	if err := s.ph.Update(request.Id, probe); err != nil {
		if isNotFound(err) {
			return gen.UpdatePhProbe404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	result, err := s.ph.Get(request.Id)
	if err != nil {
		return gen.UpdatePhProbe400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdatePhProbe200JSONResponse(toGenPhProbe(result)), nil
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
	var out gen.PhProbe
	raw, _ := json.Marshal(p)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &p.ID
	return out
}

func fromGenPhProbe(p gen.PhProbe) phModule.Probe {
	var out phModule.Probe
	raw, _ := json.Marshal(p)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
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
		resp[i] = toGenTC(tc)
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
	tc := fromGenTC(*request.Body)
	if err := s.temperature.Create(tc); err != nil {
		return gen.CreateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	tcs, err := s.temperature.List()
	if err != nil {
		return gen.CreateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	for _, found := range tcs {
		if found.Name == tc.Name {
			return gen.CreateTemperatureController200JSONResponse(toGenTC(found)), nil
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
	return gen.GetTemperatureController200JSONResponse(toGenTC(tc)), nil
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
	tc := fromGenTC(*request.Body)
	tc.ID = existing.ID
	if err := s.temperature.Update(request.Id, tc); err != nil {
		if isNotFound(err) {
			return gen.UpdateTemperatureController404JSONResponse{Message: err.Error()}, nil
		}
		return gen.UpdateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	result, err := s.temperature.Get(request.Id)
	if err != nil {
		return gen.UpdateTemperatureController400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateTemperatureController200JSONResponse(toGenTC(result)), nil
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

func toGenTC(tc *temperatureModule.TC) gen.TemperatureController {
	var out gen.TemperatureController
	raw, _ := json.Marshal(tc)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &tc.ID
	return out
}

func fromGenTC(g gen.TemperatureController) *temperatureModule.TC {
	out := new(temperatureModule.TC)
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, out) //nolint:errcheck
	return out
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

// ---- Mappers: drivers ----

func toGenDriver(d drivers.Driver) gen.Driver {
	var out gen.Driver
	raw, _ := json.Marshal(d)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &d.ID
	return out
}

func fromGenDriver(g gen.Driver) drivers.Driver {
	var out drivers.Driver
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

func fromGenDriverValidation(g gen.DriverValidationRequest) drivers.Driver {
	var out drivers.Driver
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

// ---- Mappers: outlets ----

func toGenOutlet(o connectors.Outlet) gen.Outlet {
	var out gen.Outlet
	raw, _ := json.Marshal(o)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &o.ID
	return out
}

func fromGenOutlet(g gen.Outlet) connectors.Outlet {
	var out connectors.Outlet
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

// ---- Mappers: inlets ----

func toGenInlet(i connectors.Inlet) gen.Inlet {
	var out gen.Inlet
	raw, _ := json.Marshal(i)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &i.ID
	return out
}

func fromGenInlet(g gen.Inlet) connectors.Inlet {
	var out connectors.Inlet
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

// ---- Mappers: jacks ----

func toGenJack(j connectors.Jack) gen.Jack {
	var out gen.Jack
	raw, _ := json.Marshal(j)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &j.ID
	if out.Pins == nil {
		empty := []int{}
		out.Pins = &empty
	}
	return out
}

func fromGenJack(g gen.Jack) connectors.Jack {
	var out connectors.Jack
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

// ---- Mappers: analog inputs ----

func toGenAnalogInput(a connectors.AnalogInput) gen.AnalogInput {
	var out gen.AnalogInput
	raw, _ := json.Marshal(a)
	json.Unmarshal(raw, &out) //nolint:errcheck
	out.Id = &a.ID
	return out
}

func fromGenAnalogInput(g gen.AnalogInput) connectors.AnalogInput {
	var out connectors.AnalogInput
	raw, _ := json.Marshal(g)
	json.Unmarshal(raw, &out) //nolint:errcheck
	return out
}

// ---- Drivers handlers ----

func (s *ReefPiServer) ListDrivers(_ context.Context, _ gen.ListDriversRequestObject) (gen.ListDriversResponseObject, error) {
	if s.drivers == nil {
		return gen.ListDrivers401JSONResponse{Message: "drivers not loaded"}, nil
	}
	ds, err := s.drivers.ListAll()
	if err != nil {
		return gen.ListDrivers401JSONResponse{Message: err.Error()}, nil
	}
	out := make([]gen.Driver, 0, len(ds))
	for _, d := range ds {
		out = append(out, toGenDriver(d))
	}
	return gen.ListDrivers200JSONResponse(out), nil
}

func (s *ReefPiServer) CreateDriver(_ context.Context, request gen.CreateDriverRequestObject) (gen.CreateDriverResponseObject, error) {
	if s.drivers == nil {
		return gen.CreateDriver401JSONResponse{Message: "drivers not loaded"}, nil
	}
	d := fromGenDriver(*request.Body)
	if err := s.drivers.Create(d); err != nil {
		return gen.CreateDriver400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateDriver200JSONResponse{Message: "created"}, nil
}

func (s *ReefPiServer) ListDriverOptions(_ context.Context, _ gen.ListDriverOptionsRequestObject) (gen.ListDriverOptionsResponseObject, error) {
	if s.drivers == nil {
		return gen.ListDriverOptions401JSONResponse{Message: "drivers not loaded"}, nil
	}
	opts, err := s.drivers.ListOptions()
	if err != nil {
		return gen.ListDriverOptions401JSONResponse{Message: err.Error()}, nil
	}
	out := make(gen.ListDriverOptions200JSONResponse)
	for k, params := range opts {
		var ps []map[string]interface{}
		raw, _ := json.Marshal(params)
		json.Unmarshal(raw, &ps) //nolint:errcheck
		out[k] = ps
	}
	return out, nil
}

func (s *ReefPiServer) ValidateDriver(_ context.Context, request gen.ValidateDriverRequestObject) (gen.ValidateDriverResponseObject, error) {
	if s.drivers == nil {
		return gen.ValidateDriver401JSONResponse{Message: "drivers not loaded"}, nil
	}
	d := fromGenDriverValidation(*request.Body)
	failures, err := s.drivers.ValidateParameters(d)
	if err != nil {
		return gen.ValidateDriver401JSONResponse{Message: err.Error()}, nil
	}
	// Check for name collisions
	ds, err := s.drivers.List()
	if err == nil {
		for _, existing := range ds {
			if existing.Name == d.Name && existing.ID != d.ID {
				if failures == nil {
					failures = make(map[string][]string)
				}
				failures["name"] = []string{"The name " + d.Name + " is already in use"}
			}
		}
	}
	if len(failures) > 0 {
		flat := make(gen.ValidateDriver400JSONResponse)
		for k, v := range failures {
			flat["config."+strings.ToLower(k)] = strings.Join(v, "\n")
		}
		return flat, nil
	}
	return gen.ValidateDriver200JSONResponse{}, nil
}

func (s *ReefPiServer) GetDriver(_ context.Context, request gen.GetDriverRequestObject) (gen.GetDriverResponseObject, error) {
	if s.drivers == nil {
		return gen.GetDriver401JSONResponse{Message: "drivers not loaded"}, nil
	}
	d, err := s.drivers.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetDriver404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetDriver401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetDriver200JSONResponse(toGenDriver(d)), nil
}

func (s *ReefPiServer) UpdateDriver(_ context.Context, request gen.UpdateDriverRequestObject) (gen.UpdateDriverResponseObject, error) {
	if s.drivers == nil {
		return gen.UpdateDriver401JSONResponse{Message: "drivers not loaded"}, nil
	}
	d := fromGenDriver(*request.Body)
	if err := s.drivers.Update(request.Id, d); err != nil {
		return gen.UpdateDriver400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateDriver200JSONResponse{Message: "updated"}, nil
}

func (s *ReefPiServer) DeleteDriver(_ context.Context, request gen.DeleteDriverRequestObject) (gen.DeleteDriverResponseObject, error) {
	if s.drivers == nil {
		return gen.DeleteDriver401JSONResponse{Message: "drivers not loaded"}, nil
	}
	if err := s.drivers.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteDriver404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteDriver401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteDriver200JSONResponse{Message: "deleted"}, nil
}

// ---- Outlets handlers ----

func (s *ReefPiServer) ListOutlets(_ context.Context, _ gen.ListOutletsRequestObject) (gen.ListOutletsResponseObject, error) {
	if s.outlets == nil {
		return gen.ListOutlets401JSONResponse{Message: "outlets not loaded"}, nil
	}
	os, err := s.outlets.List()
	if err != nil {
		return gen.ListOutlets401JSONResponse{Message: err.Error()}, nil
	}
	out := make([]gen.Outlet, 0, len(os))
	for _, o := range os {
		out = append(out, toGenOutlet(o))
	}
	return gen.ListOutlets200JSONResponse(out), nil
}

func (s *ReefPiServer) CreateOutlet(_ context.Context, request gen.CreateOutletRequestObject) (gen.CreateOutletResponseObject, error) {
	if s.outlets == nil {
		return gen.CreateOutlet401JSONResponse{Message: "outlets not loaded"}, nil
	}
	o := fromGenOutlet(*request.Body)
	if err := s.outlets.Create(o); err != nil {
		return gen.CreateOutlet400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateOutlet200JSONResponse{Message: "created"}, nil
}

func (s *ReefPiServer) GetOutlet(_ context.Context, request gen.GetOutletRequestObject) (gen.GetOutletResponseObject, error) {
	if s.outlets == nil {
		return gen.GetOutlet401JSONResponse{Message: "outlets not loaded"}, nil
	}
	o, err := s.outlets.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetOutlet404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetOutlet401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetOutlet200JSONResponse(toGenOutlet(o)), nil
}

func (s *ReefPiServer) UpdateOutlet(_ context.Context, request gen.UpdateOutletRequestObject) (gen.UpdateOutletResponseObject, error) {
	if s.outlets == nil {
		return gen.UpdateOutlet401JSONResponse{Message: "outlets not loaded"}, nil
	}
	o := fromGenOutlet(*request.Body)
	if err := s.outlets.Update(request.Id, o); err != nil {
		return gen.UpdateOutlet400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateOutlet200JSONResponse{Message: "updated"}, nil
}

func (s *ReefPiServer) DeleteOutlet(_ context.Context, request gen.DeleteOutletRequestObject) (gen.DeleteOutletResponseObject, error) {
	if s.outlets == nil {
		return gen.DeleteOutlet401JSONResponse{Message: "outlets not loaded"}, nil
	}
	if err := s.outlets.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteOutlet404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteOutlet401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteOutlet200JSONResponse{Message: "deleted"}, nil
}

// ---- Inlets handlers ----

func (s *ReefPiServer) ListInlets(_ context.Context, _ gen.ListInletsRequestObject) (gen.ListInletsResponseObject, error) {
	if s.inlets == nil {
		return gen.ListInlets401JSONResponse{Message: "inlets not loaded"}, nil
	}
	is, err := s.inlets.List()
	if err != nil {
		return gen.ListInlets401JSONResponse{Message: err.Error()}, nil
	}
	out := make([]gen.Inlet, 0, len(is))
	for _, i := range is {
		out = append(out, toGenInlet(i))
	}
	return gen.ListInlets200JSONResponse(out), nil
}

func (s *ReefPiServer) CreateInlet(_ context.Context, request gen.CreateInletRequestObject) (gen.CreateInletResponseObject, error) {
	if s.inlets == nil {
		return gen.CreateInlet401JSONResponse{Message: "inlets not loaded"}, nil
	}
	i := fromGenInlet(*request.Body)
	if err := s.inlets.Create(i); err != nil {
		return gen.CreateInlet400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateInlet200JSONResponse{Message: "created"}, nil
}

func (s *ReefPiServer) GetInlet(_ context.Context, request gen.GetInletRequestObject) (gen.GetInletResponseObject, error) {
	if s.inlets == nil {
		return gen.GetInlet401JSONResponse{Message: "inlets not loaded"}, nil
	}
	i, err := s.inlets.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetInlet404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetInlet401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetInlet200JSONResponse(toGenInlet(i)), nil
}

func (s *ReefPiServer) UpdateInlet(_ context.Context, request gen.UpdateInletRequestObject) (gen.UpdateInletResponseObject, error) {
	if s.inlets == nil {
		return gen.UpdateInlet401JSONResponse{Message: "inlets not loaded"}, nil
	}
	i := fromGenInlet(*request.Body)
	if err := s.inlets.Update(request.Id, i); err != nil {
		return gen.UpdateInlet400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateInlet200JSONResponse{Message: "updated"}, nil
}

func (s *ReefPiServer) DeleteInlet(_ context.Context, request gen.DeleteInletRequestObject) (gen.DeleteInletResponseObject, error) {
	if s.inlets == nil {
		return gen.DeleteInlet401JSONResponse{Message: "inlets not loaded"}, nil
	}
	if err := s.inlets.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteInlet404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteInlet401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteInlet200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ReadInlet(_ context.Context, request gen.ReadInletRequestObject) (gen.ReadInletResponseObject, error) {
	if s.inlets == nil {
		return gen.ReadInlet401JSONResponse{Message: "inlets not loaded"}, nil
	}
	v, err := s.inlets.Read(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.ReadInlet404JSONResponse{Message: err.Error()}, nil
		}
		return gen.ReadInlet401JSONResponse{Message: err.Error()}, nil
	}
	return gen.ReadInlet200JSONResponse(v), nil
}

// ---- Jacks handlers ----

func (s *ReefPiServer) ListJacks(_ context.Context, _ gen.ListJacksRequestObject) (gen.ListJacksResponseObject, error) {
	if s.jacks == nil {
		return gen.ListJacks401JSONResponse{Message: "jacks not loaded"}, nil
	}
	js, err := s.jacks.List()
	if err != nil {
		return gen.ListJacks401JSONResponse{Message: err.Error()}, nil
	}
	out := make([]gen.Jack, 0, len(js))
	for _, j := range js {
		out = append(out, toGenJack(j))
	}
	return gen.ListJacks200JSONResponse(out), nil
}

func (s *ReefPiServer) CreateJack(_ context.Context, request gen.CreateJackRequestObject) (gen.CreateJackResponseObject, error) {
	if s.jacks == nil {
		return gen.CreateJack401JSONResponse{Message: "jacks not loaded"}, nil
	}
	j := fromGenJack(*request.Body)
	if err := s.jacks.Create(j); err != nil {
		return gen.CreateJack400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateJack200JSONResponse{Message: "created"}, nil
}

func (s *ReefPiServer) GetJack(_ context.Context, request gen.GetJackRequestObject) (gen.GetJackResponseObject, error) {
	if s.jacks == nil {
		return gen.GetJack401JSONResponse{Message: "jacks not loaded"}, nil
	}
	j, err := s.jacks.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetJack404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetJack401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetJack200JSONResponse(toGenJack(j)), nil
}

func (s *ReefPiServer) UpdateJack(_ context.Context, request gen.UpdateJackRequestObject) (gen.UpdateJackResponseObject, error) {
	if s.jacks == nil {
		return gen.UpdateJack401JSONResponse{Message: "jacks not loaded"}, nil
	}
	j := fromGenJack(*request.Body)
	if err := s.jacks.Update(request.Id, j); err != nil {
		return gen.UpdateJack400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateJack200JSONResponse{Message: "updated"}, nil
}

func (s *ReefPiServer) DeleteJack(_ context.Context, request gen.DeleteJackRequestObject) (gen.DeleteJackResponseObject, error) {
	if s.jacks == nil {
		return gen.DeleteJack401JSONResponse{Message: "jacks not loaded"}, nil
	}
	if err := s.jacks.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteJack404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteJack401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteJack200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ControlJack(_ context.Context, request gen.ControlJackRequestObject) (gen.ControlJackResponseObject, error) {
	if s.jacks == nil {
		return gen.ControlJack401JSONResponse{Message: "jacks not loaded"}, nil
	}
	pinValues := make(connectors.PinValues)
	for k, v := range *request.Body {
		var pin int
		if n, err := json.Number(k).Int64(); err == nil {
			pinValues[int(n)] = v
		} else {
			// fallback: unmarshal the key as JSON number
			_ = json.Unmarshal([]byte(k), &pin)
			pinValues[pin] = v
		}
	}
	if err := s.jacks.Control(request.Id, pinValues); err != nil {
		return gen.ControlJack400JSONResponse{Message: err.Error()}, nil
	}
	return gen.ControlJack200JSONResponse{Message: "ok"}, nil
}

// ---- AnalogInputs handlers ----

func (s *ReefPiServer) ListAnalogInputs(_ context.Context, _ gen.ListAnalogInputsRequestObject) (gen.ListAnalogInputsResponseObject, error) {
	if s.analogInputs == nil {
		return gen.ListAnalogInputs401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	as, err := s.analogInputs.List()
	if err != nil {
		return gen.ListAnalogInputs401JSONResponse{Message: err.Error()}, nil
	}
	out := make([]gen.AnalogInput, 0, len(as))
	for _, a := range as {
		out = append(out, toGenAnalogInput(a))
	}
	return gen.ListAnalogInputs200JSONResponse(out), nil
}

func (s *ReefPiServer) CreateAnalogInput(_ context.Context, request gen.CreateAnalogInputRequestObject) (gen.CreateAnalogInputResponseObject, error) {
	if s.analogInputs == nil {
		return gen.CreateAnalogInput401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	a := fromGenAnalogInput(*request.Body)
	if err := s.analogInputs.Create(a); err != nil {
		return gen.CreateAnalogInput400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateAnalogInput200JSONResponse{Message: "created"}, nil
}

func (s *ReefPiServer) GetAnalogInput(_ context.Context, request gen.GetAnalogInputRequestObject) (gen.GetAnalogInputResponseObject, error) {
	if s.analogInputs == nil {
		return gen.GetAnalogInput401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	a, err := s.analogInputs.Get(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.GetAnalogInput404JSONResponse{Message: err.Error()}, nil
		}
		return gen.GetAnalogInput401JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetAnalogInput200JSONResponse(toGenAnalogInput(a)), nil
}

func (s *ReefPiServer) UpdateAnalogInput(_ context.Context, request gen.UpdateAnalogInputRequestObject) (gen.UpdateAnalogInputResponseObject, error) {
	if s.analogInputs == nil {
		return gen.UpdateAnalogInput401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	a := fromGenAnalogInput(*request.Body)
	if err := s.analogInputs.Update(request.Id, a); err != nil {
		return gen.UpdateAnalogInput400JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateAnalogInput200JSONResponse{Message: "updated"}, nil
}

func (s *ReefPiServer) DeleteAnalogInput(_ context.Context, request gen.DeleteAnalogInputRequestObject) (gen.DeleteAnalogInputResponseObject, error) {
	if s.analogInputs == nil {
		return gen.DeleteAnalogInput401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	if err := s.analogInputs.Delete(request.Id); err != nil {
		if isNotFound(err) {
			return gen.DeleteAnalogInput404JSONResponse{Message: err.Error()}, nil
		}
		return gen.DeleteAnalogInput401JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteAnalogInput200JSONResponse{Message: "deleted"}, nil
}

func (s *ReefPiServer) ReadAnalogInput(_ context.Context, request gen.ReadAnalogInputRequestObject) (gen.ReadAnalogInputResponseObject, error) {
	if s.analogInputs == nil {
		return gen.ReadAnalogInput401JSONResponse{Message: "analog inputs not loaded"}, nil
	}
	v, err := s.analogInputs.Read(request.Id)
	if err != nil {
		if isNotFound(err) {
			return gen.ReadAnalogInput404JSONResponse{Message: err.Error()}, nil
		}
		return gen.ReadAnalogInput401JSONResponse{Message: err.Error()}, nil
	}
	return gen.ReadAnalogInput200JSONResponse(v), nil
}
