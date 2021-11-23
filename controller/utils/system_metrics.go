//go:build !windows
// +build !windows

package utils

import (
	"github.com/shirou/gopsutil/load"
)

func AvgCpuLoad() (*load.AvgStat, error) {
	return load.Avg()
}
