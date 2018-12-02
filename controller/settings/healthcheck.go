package settings


type HealthCheckNotify struct {
	Enable    bool    `json:"enable"`
	MaxMemory float64 `json:"max_memory"`
	MaxCPU    float64 `json:"max_cpu"`
}
