package utils

import "testing"

func TestTwoDecimal(t *testing.T) {
	if rounded := RoundToTwoDecimal(1.2345); rounded != 1.23 {
		t.Error("Expected 1.23, found", rounded)
	}
}

func TestFormatFloat(t *testing.T) {
	if s := FormatFloat(3.14); s != "3.14" {
		t.Errorf("Expected '3.14', got '%s'", s)
	}
	if s := FormatFloat(0); s != "0" {
		t.Errorf("Expected '0', got '%s'", s)
	}
	if s := FormatFloat(1.0); s != "1" {
		t.Errorf("Expected '1', got '%s'", s)
	}
}
