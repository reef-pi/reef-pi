package api

import (
	"context"
	"errors"

	"github.com/reef-pi/reef-pi/controller/api/gen"
	equipmentModule "github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/storage"
)

// ReefPiServer implements gen.StrictServerInterface for all migrated modules.
type ReefPiServer struct {
	equipment *equipmentModule.Controller
}

// NewReefPiServer constructs a ReefPiServer.
func NewReefPiServer(equipment *equipmentModule.Controller) *ReefPiServer {
	return &ReefPiServer{equipment: equipment}
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
