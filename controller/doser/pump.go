package doser

type Pump struct {
	FlowRate int  `json:"flow_rate"` // Example: Adafruit peristaltic pump is 100 ml/minute
	Pin      int  `json:"pin"`       // pin within the jack
	Jack     int  `json:"jack"`      // which jack
	State    bool `json:"state"`
}
