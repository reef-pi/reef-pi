package controller

import (
	"strings"
	"testing"
)

func Test_ReadTemperature(t *testing.T) {
	data := `76 01 4b 46 7f ff 0a 10 79 : crc=79 YES
76 01 4b 46 7f ff 0a 10 79 t=23375`

	v, err := readTemperature(strings.NewReader(data))
	if err != nil {
		t.Error(err)
	}
	if v != 23375 {
		t.Error("Expected 23375 found:", v)
	}

}
