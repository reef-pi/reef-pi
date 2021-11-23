package utils

import "testing"

func TestTwoDecimal(t *testing.T) {
	if rounded := RoundToTwoDecimal(1.2345); rounded != 1.23 {
		t.Error("Expected 1.23, found", rounded)
	}
}
