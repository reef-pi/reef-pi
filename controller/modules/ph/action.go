package ph

type Action struct {
	Equipment string `json:"equipment"`
	On        bool   `json:"on"`
}

type Notify struct {
	Enable bool    `json:"enable"`
	Min    float64 `json:"min"`
	Max    float64 `json:"max"`
}

type ProbeConfig struct {
	Min     float64  `json:"min"`
	Max     float64  `json:"max"`
	Control bool     `json:"control"`
	Actions []Action `json:"actions"`
	Enable  bool     `json:"enable"`
	Notify  Notify   `json:"notify"`
}
