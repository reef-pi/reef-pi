package driver

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
	io.Closer
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
	GetInputPin(name string) (InputPin, error)
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
	GetOutputPin(name string) (OutputPin, error)
}

//////////////////////////////////////////////////

type PWMChannel interface {
	Name() string
	Set(value float64) error
}

type PWM interface {
	Driver
	PWMChannels() []PWMChannel
	GetPWMChannel(name string) (PWMChannel, error)
}
