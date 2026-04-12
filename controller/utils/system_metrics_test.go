//go:build !windows
// +build !windows

package utils

import (
	"testing"
)

func TestAvgCpuLoad(t *testing.T) {
	stat, err := AvgCpuLoad()
	if err != nil {
		t.Skip("AvgCpuLoad not available in this environment:", err)
	}
	if stat == nil {
		t.Error("Expected non-nil AvgStat")
	}
}
