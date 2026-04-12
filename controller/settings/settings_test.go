package settings

import "testing"

func TestValidate(t *testing.T) {
	tests := []struct {
		name    string
		address string
		wantErr bool
	}{
		{"valid host:port", "0.0.0.0:80", false},
		{"valid localhost", "localhost:8080", false},
		{"valid empty host", ":8080", false},
		{"missing port", "0.0.0.0", true},
		{"empty string", "", true},
		{"port only no colon", "8080", true},
		{"only colon", ":", false}, // net.SplitHostPort accepts ":"
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := Settings{Address: tt.address}
			err := s.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate(%q) error = %v, wantErr %v", tt.address, err, tt.wantErr)
			}
		})
	}
}

func TestDefaultSettings(t *testing.T) {
	s := DefaultSettings
	if s.Name == "" {
		t.Error("DefaultSettings.Name must not be empty")
	}
	if s.Address == "" {
		t.Error("DefaultSettings.Address must not be empty")
	}
	if err := s.Validate(); err != nil {
		t.Errorf("DefaultSettings must be valid, got: %v", err)
	}
	if s.RPI_PWMFreq <= 0 {
		t.Errorf("DefaultSettings.RPI_PWMFreq must be positive, got %d", s.RPI_PWMFreq)
	}
	if s.HealthCheck.MaxMemory <= 0 {
		t.Errorf("DefaultSettings.HealthCheck.MaxMemory must be positive, got %f", s.HealthCheck.MaxMemory)
	}
}

func TestDefaultCapabilities(t *testing.T) {
	c := DefaultCapabilities
	// Core capabilities expected to be enabled by default
	for name, enabled := range map[string]bool{
		"Dashboard":     c.Dashboard,
		"Equipment":     c.Equipment,
		"Timers":        c.Timers,
		"Temperature":   c.Temperature,
		"ATO":           c.ATO,
		"Configuration": c.Configuration,
		"Macro":         c.Macro,
		"HealthCheck":   c.HealthCheck,
	} {
		if !enabled {
			t.Errorf("DefaultCapabilities.%s should be enabled by default", name)
		}
	}
	// DevMode must be off by default
	if c.DevMode {
		t.Error("DefaultCapabilities.DevMode must be false by default")
	}
}
