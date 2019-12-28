package telemetry

import (
	"context"
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// https://www.raspberrypi.org/documentation/raspbian/applications/vcgencmd.md

const (
	_vcgencmd      = "vcgencmd"
	_get_throttled = "get_throttled"
	_measure_volts = "measure_volt"
	_timeout       = time.Second
	_separator     = "="
	_unknown       = "unknown"
)

type ThrottleType uint64

func (t *ThrottleType) String() string {
	txt, ok := tTypesMap[*t]
	if !ok {
		return _unknown
	}
	return txt
}

const (
	UnderVoltage                  ThrottleType = 0 //0x5000
	ARMFrequencyCapped            ThrottleType = 1
	CurrentlyThrottled            ThrottleType = 2
	SoftcoreTempLimit             ThrottleType = 3
	UnderVoltageHasOccurred       ThrottleType = 16
	ARMFrequencyCappedHasOccurred ThrottleType = 17
	ThrottlingHasOccurred         ThrottleType = 18
	SoftcoreTmpLimitHasOccurred   ThrottleType = 19
)

var (
	tTypesMap = map[ThrottleType]string{
		UnderVoltage:                  "under voltage",
		ARMFrequencyCapped:            "arm frequency capped",
		CurrentlyThrottled:            "currently throttled",
		SoftcoreTempLimit:             "softcore temperature limit",
		UnderVoltageHasOccurred:       "under voltage has occurred",
		ARMFrequencyCappedHasOccurred: "arm frequency capped has occured",
		ThrottlingHasOccurred:         "throttling has occurred",
		SoftcoreTmpLimitHasOccurred:   "softcore temperature limit has occurred",
	}
)

type Runner func() ([]byte, error)
type Factory func(ctx context.Context, name string, arg ...string) Runner

func ExecFactory(ctx context.Context, name string, arg ...string) Runner {
	return exec.CommandContext(ctx, name, arg...).CombinedOutput
}

func VcgencmdGetThrottled() ([]ThrottleType, error) {
	ctx, cancel := context.WithTimeout(context.Background(), _timeout)
	defer cancel()
	return GetThrottled(ctx, ExecFactory)
}

func GetThrottled(ctx context.Context, cf Factory) ([]ThrottleType, error) {
	out, err := cf(ctx, _vcgencmd, _get_throttled)()
	if err != nil {
		return nil, err
	}
	parts := strings.Split(string(out), _separator)
	if len(parts) != 2 {
		return nil, fmt.Errorf("failed to parse output. output: %s", string(out))
	}
	data := strings.TrimSpace(parts[1])
	v, err := strconv.ParseInt(data, 0, 20)
	if err != nil {
		return nil, err
	}
	return GetThrottleTypes(int(v)), nil
}

func GetThrottleTypes(v int) (tTypes []ThrottleType) {
	for tType, _ := range tTypesMap {
		mask := 1 << tType
		b := int(v) & mask
		if b != 0 {
			tTypes = append(tTypes, tType)
		}
	}
	return tTypes
}
