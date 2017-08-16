package utils

import (
	"testing"
)

func TestADC(t *testing.T) {
	adc := NewADC()
	adc.config.DevMode = true
	if err := adc.Start(); err != nil {
		t.Fatal("Failed to start adc. Error:", err)
	}
	if err := adc.Stop(); err != nil {
		t.Fatal("Failed to stop adc. Error:", err)
	}
	_, err := adc.Read(1)
	if err != nil {
		t.Fatal("Failed to read adc. Error:", err)
	}
}
