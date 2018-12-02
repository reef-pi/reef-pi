package drivers

import "io"

// Metadata represents basic information about a driver
// for the API response.
type Metadata struct {
	Name         string       `json:"name"`
	Description  string       `json:"description"`
	Capabilities Capabilities `json:"capabilities"`
}

// Capabilities defines which
type Capabilities struct {
	Input       bool `json:"input"`
	Output      bool `json:"output"`
	PWM         bool `json:"pwm"`
	Temperature bool `json:"temperature"`
	PH          bool `json:"ph"`
}

type Driver interface {
	Metadata() Metadata
}

///////////////////////////////////////////////////

// Pin represents a single-bit digital input or output
type Pin interface {
	io.Closer

	Name() string
}

///////////////////////////////////////////////////

// InputPin represents an input pin with a single digital input
// value.
type InputPin interface {
	Pin
	// Read returns whether this input is logical high (true) or low (false)
	Read() (bool, error)
}

type Input interface {
	Driver
	InputPins() []InputPin
}

//////////////////////////////////////////////////

type OutputPin interface {
	Pin
	Write(state bool) error
	LastState() bool
}

type Output interface {
	Driver
	OutputPins() []OutputPin
}
