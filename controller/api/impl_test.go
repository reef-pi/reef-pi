package api

import (
	"context"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
	"github.com/reef-pi/reef-pi/controller/api/gen"
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
