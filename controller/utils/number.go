package utils

import "math"

//RoundToTwoDecimal Round float64 to 2 decimals
func RoundToTwoDecimal(f float64) float64 {
	return math.Round(f*100) / 100
}
