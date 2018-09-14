// +build windows

package utils

import (
	"github.com/shirou/gopsutil/load"
)

func AvgCpuLoad() (*load.AvgStat, error) {
	ret := load.AvgStat{
		Load1:  0.50,
		Load5:  0.50,
		Load15: 0.50}

	return &ret, nil
}
