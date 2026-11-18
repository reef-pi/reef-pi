package api

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/api/gen"
	macroModule "github.com/reef-pi/reef-pi/controller/modules/macro"
	temperatureModule "github.com/reef-pi/reef-pi/controller/modules/temperature"
)

func TestListTemperatureSensors(t *testing.T) {
	t.Parallel()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	temperature, err := temperatureModule.New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	server := NewReefPiServer(ServerConfig{Temperature: temperature})

	response, err := server.ListTemperatureSensors(context.Background(), gen.ListTemperatureSensorsRequestObject{})
	if err != nil {
		t.Fatal(err)
	}
	sensors, ok := response.(gen.ListTemperatureSensors200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 response, got %T", response)
	}
	if len(sensors) != 2 {
		t.Fatalf("expected dev mode sensors, got %#v", sensors)
	}
	if sensors[0] != "28-devmodeenable" || sensors[1] != "10-devmodeenable" {
		t.Fatalf("unexpected sensors: %#v", sensors)
	}
}

func newMacroTestServer(t *testing.T) (*ReefPiServer, *macroModule.Subsystem) {
	t.Helper()
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	macros, err := macroModule.New(true, con)
	if err != nil {
		t.Fatal(err)
	}
	if err := macros.Setup(); err != nil {
		t.Fatal(err)
	}
	return NewReefPiServer(ServerConfig{Macro: macros}), macros
}

func macroStep(stepType string, config map[string]interface{}) map[string]interface{} {
	return map[string]interface{}{"type": stepType, "config": config}
}

func TestCreateMacroPersistsSteps(t *testing.T) {
	server, macros := newMacroTestServer(t)
	steps := []map[string]interface{}{
		macroStep("equipment", map[string]interface{}{"id": "5", "on": true}),
		macroStep("wait", map[string]interface{}{"duration": 300}),
	}

	response, err := server.CreateMacro(context.Background(), gen.CreateMacroRequestObject{
		Body: &gen.Macro{Name: "Feed", Steps: &steps},
	})
	if err != nil {
		t.Fatal(err)
	}
	created, ok := response.(gen.CreateMacro200JSONResponse)
	if !ok {
		t.Fatalf("expected 200 response, got %T", response)
	}
	if created.Steps == nil || len(*created.Steps) != 2 {
		t.Fatalf("expected 2 steps in the response, got %#v", created.Steps)
	}

	stored, err := macros.Get(*created.Id)
	if err != nil {
		t.Fatal(err)
	}
	if len(stored.Steps) != 2 || stored.Steps[0].Type != "equipment" || stored.Steps[1].Type != "wait" {
		t.Fatalf("steps were not stored: %#v", stored.Steps)
	}
	var generic macroModule.GenericStep
	if err := json.Unmarshal(stored.Steps[0].Config, &generic); err != nil {
		t.Fatal(err)
	}
	if generic.ID != "5" || !generic.On {
		t.Fatalf("unexpected stored config: %s", stored.Steps[0].Config)
	}
}

func TestCreateMacroRejectsStepWithoutType(t *testing.T) {
	server, macros := newMacroTestServer(t)
	steps := []map[string]interface{}{{"config": map[string]interface{}{"id": "5"}}}

	response, err := server.CreateMacro(context.Background(), gen.CreateMacroRequestObject{
		Body: &gen.Macro{Name: "Broken", Steps: &steps},
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := response.(gen.CreateMacro400JSONResponse); !ok {
		t.Fatalf("expected 400 response, got %T", response)
	}
	list, err := macros.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(list) != 0 {
		t.Fatalf("macro should not have been created: %#v", list)
	}
}

func TestUpdateMacroReplacesStepsOnlyWhenProvided(t *testing.T) {
	server, macros := newMacroTestServer(t)
	original := []map[string]interface{}{macroStep("equipment", map[string]interface{}{"id": "1", "on": true})}
	response, err := server.CreateMacro(context.Background(), gen.CreateMacroRequestObject{
		Body: &gen.Macro{Name: "Feed", Steps: &original},
	})
	if err != nil {
		t.Fatal(err)
	}
	id := *response.(gen.CreateMacro200JSONResponse).Id

	// A rename without steps keeps the existing ones.
	if _, err := server.UpdateMacro(context.Background(), gen.UpdateMacroRequestObject{
		Id: id, Body: &gen.Macro{Name: "Feed 2"},
	}); err != nil {
		t.Fatal(err)
	}
	stored, err := macros.Get(id)
	if err != nil {
		t.Fatal(err)
	}
	if stored.Name != "Feed 2" || len(stored.Steps) != 1 {
		t.Fatalf("rename should keep steps: %#v", stored)
	}

	// Providing steps replaces them.
	replacement := []map[string]interface{}{
		macroStep("equipment", map[string]interface{}{"id": "2", "on": false}),
		macroStep("wait", map[string]interface{}{"duration": 10}),
	}
	update, err := server.UpdateMacro(context.Background(), gen.UpdateMacroRequestObject{
		Id: id, Body: &gen.Macro{Name: "Feed 2", Steps: &replacement},
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := update.(gen.UpdateMacro200JSONResponse); !ok {
		t.Fatalf("expected 200 response, got %T", update)
	}
	stored, err = macros.Get(id)
	if err != nil {
		t.Fatal(err)
	}
	if len(stored.Steps) != 2 {
		t.Fatalf("steps were not replaced: %#v", stored.Steps)
	}
}
