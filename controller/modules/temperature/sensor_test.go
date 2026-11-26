package temperature

import (
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func Test_ReadTemperature(t *testing.T) {
	data := `76 01 4b 46 7f ff 0a 10 79 : crc=79 YES
76 01 4b 46 7f ff 0a 10 79 t=23375`
	tc := TC{
		Fahrenheit: true,
	}
	v, err := tc.readTemperature(strings.NewReader(data))
	if err != nil {
		t.Error(err)
	}
	if v != 74.08 {
		t.Error("Expected 74.08 found:", v)
	}
}

func Test_InvalidTemperature(t *testing.T) {
	tc := TC{
		Fahrenheit: false,
	}

	data := `76 01 4b 46 7f ff 0a 10 79 : crc=79 YES
76 01 4b 46 7f ff 0a 10 79 t=-60375`

	_, err := tc.readTemperature(strings.NewReader(data))
	if err == nil {
		t.Error("value is out of range and should be an error")
	}

	data = `76 01 4b 46 7f ff 0a 10 79 : crc=79 YES
76 01 4b 46 7f ff 0a 10 79 t=156000`

	_, err = tc.readTemperature(strings.NewReader(data))
	if err == nil {
		t.Error("value is out of range and should be an error")
	}

}

func TestReadTemperatureInvalidPayloads(t *testing.T) {
	tc := TC{}

	tests := []struct {
		name string
		data string
	}{
		{
			name: "missing first line",
			data: "",
		},
		{
			name: "crc not ready",
			data: "76 01 4b 46 7f ff 0a 10 79 : crc=79 NO\n76 01 4b 46 7f ff 0a 10 79 t=23375",
		},
		{
			name: "missing second line",
			data: "76 01 4b 46 7f ff 0a 10 79 : crc=79 YES\n",
		},
		{
			name: "missing temperature separator",
			data: "76 01 4b 46 7f ff 0a 10 79 : crc=79 YES\n76 01 4b 46 7f ff 0a 10 79 t23375",
		},
		{
			name: "non numeric temperature",
			data: "76 01 4b 46 7f ff 0a 10 79 : crc=79 YES\n76 01 4b 46 7f ff 0a 10 79 t=warm",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := tc.readTemperature(strings.NewReader(tt.data)); err == nil {
				t.Fatal("expected invalid payload to return an error")
			}
		})
	}
}

func TestReadTemperatureCelsius(t *testing.T) {
	data := `76 01 4b 46 7f ff 0a 10 79 : crc=79 YES
76 01 4b 46 7f ff 0a 10 79 t=23375`
	tc := TC{}
	v, err := tc.readTemperature(strings.NewReader(data))
	if err != nil {
		t.Fatal(err)
	}
	if v != 23.38 {
		t.Fatalf("expected 23.38, got %v", v)
	}
}

func TestReadDevMode(t *testing.T) {
	c := setupTempController(t)

	defer c.c.Store().Close()
	tc := &TC{Sensor: "28-devmodeenable", Fahrenheit: true}
	v, err := c.Read(tc)
	if err != nil || v != 78.5 {
		t.Fatalf("initial fake reading = %v, %v; want 78.5°F", v, err)
	}
	tc.Fahrenheit = false
	v, err = c.Read(tc)
	if err != nil || v != 25.83 {
		t.Fatalf("same fake reading in Celsius = %v, %v; want 25.83°C", v, err)
	}
}

func TestReadMissingDevice(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()
	c, err := New(false, con)
	if err != nil {
		t.Fatal(err)
	}

	if v, err := c.Read(&TC{Sensor: "28-missing"}); err == nil {
		t.Fatalf("expected missing sensor read to fail, got value %v", v)
	}
}

func TestReadMissingAnalogInput(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()
	if err := con.DM().AnalogInputs().Setup(); err != nil {
		t.Fatal(err)
	}
	c, err := New(false, con)
	if err != nil {
		t.Fatal(err)
	}

	if v, err := c.Read(&TC{AnalogInput: "missing"}); err == nil {
		t.Fatalf("expected missing analog input read to fail, got value %v", v)
	}
}

func readFromFile(path string) (float32, error) {
	fi, err := os.Open(path)
	if err != nil {
		return 0, err
	}
	defer fi.Close()
	data := make([]byte, 100)
	count, err := fi.Read(data)
	if err != nil {
		return 0, err
	}
	v := strings.TrimSpace(string(data[:count]))
	t, err := strconv.ParseFloat(v, 32)
	if err != nil {
		return 0, err
	}
	return float32(t), nil
}
