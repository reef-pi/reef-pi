package utils

import (
	"math"
	"strconv"
)

// RoundToTwoDecimal Round float64 to 2 decimals
func RoundToTwoDecimal(f float64) float64 {
	return math.Round(f*100) / 100
}
func FormatFloat(v float64) string {
	return strconv.FormatFloat(v, 'f', -1, 64)
}
