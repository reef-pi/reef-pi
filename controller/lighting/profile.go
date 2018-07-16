package lighting

import (
	"fmt"
	"log"
	"math"
	"time"
)

type Profile struct {
	Type   string      `json:"type"`
	Config interface{} `json:"config"`
}

type ReefPiConfig struct {
	Values []int `json:"values"` // 12 ticks after every 2 hours
}

type FixedConfig struct {
	Fixed int `json:"fixed"`
}

type DiurnalConfig struct {
	Start string `json:"start"`
	End   string `json:"end"`
	Min   int    `json:"min"`
	Max   int    `json:"max"`
}

/*
(Current time - Start time)* 2*pi / (End time - Start Time)
PercentLight * (Max - Min) + Min
=(1-COS((minutes-startMinutes)2PI/(End Minutes-startMinutes))^3) * (Max - Min) + Min
*/
const TimeFormat = "15:04"

func (d DiurnalConfig) GetValue(t time.Time) int {
	s, err := time.Parse(TimeFormat, d.Start)
	if err != nil {
		log.Println("ERROR: lighting subsystem, failed to parse start time in diurnal cycle. Error:", err)
		return 0
	}
	e, err := time.Parse(TimeFormat, d.End)
	if err != nil {
		log.Println("ERROR: lighting subsystem, failed to parse end time in diurnal cycle. Error:", err)
		return 0
	}
	if t.Before(s) {
		log.Println("Lighting sub-system: diurnal profile: before start time. Value: 0")
		return 0
	}
	if t.After(e) {
		log.Println("Lighting sub-system: diurnal profile: after end time. Value: 0")
		return 0
	}
	totalMinutes := int(e.Sub(s) / time.Minute)
	pastMinutes := int(t.Sub(s) / time.Minute)
	percent := float64(pastMinutes) * 2 * math.Pi / float64(totalMinutes)
	k := math.Pow(math.Cos(percent), 3)
	v := int((1 - k) * float64(d.Max-d.Min))
	//log.Println("Time:", t, "V:", v+d.Min, "Total minutes:", totalMinutes, "Past minutes:", pastMinutes, "Percent:", percent, "K:", k)
	v = v + d.Min
	if v > d.Max {
		//v = d.Max
	}
	//	log.Printf("Time:%s V:%03d", t, v)
	fmt.Println(v)
	//(percent * (d.Max - d.Min)) + d.Min
	return v
}

type FreeFormConfig struct {
	Values []int `json:"values"`
	Period int   `json:"period"`
}

func (ch Channel) GetValue(t time.Time) int {
	switch ch.Profile.Type {
	case "diurnal":
	case "reef-pi":
	default:
		return ch.GetValue12Hour(t)
	}
	return ch.GetValue12Hour(t)
}

func (ch Channel) GetValue12Hour(t time.Time) int {
	series := ch.Values
	h1 := t.Hour() / 2
	h2 := h1 + 1
	if h2 >= 12 {
		h2 = 0
	}
	m := float64(t.Minute() + ((t.Hour() % 2) * 60))
	from := float64(series[h1])
	to := float64(series[h2])
	f := from + ((to - from) / 120.0 * m)
	return int(f)
}
