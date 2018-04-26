package temperature

import (
	"os"
	"strconv"
	"strings"
	"testing"
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
	if v != 74.075 {
		t.Error("Expected 23375 found:", v)
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
