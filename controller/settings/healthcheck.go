package settings

type HealthCheckNotify struct {
	Enable         bool    `json:"enable"`
	MaxMemory      float64 `json:"max_memory"`
	MaxCPU         float64 `json:"max_cpu"`
	ReportEnable   bool    `json:"report_enable"`
	ReportSchedule string  `json:"report_schedule"`
}
