package system

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDisplayStateReadsFilesAndReportsBrightnessErrors(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	powerFile := filepath.Join(dir, "power")
	brightnessFile := filepath.Join(dir, "brightness")
	if err := os.WriteFile(powerFile, []byte("0"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(brightnessFile, []byte("77\n"), 0644); err != nil {
		t.Fatal(err)
	}

	c := &Controller{
		PowerFile:      powerFile,
		BrightnessFile: brightnessFile,
	}
	state, err := c.currentDisplayState()
	if err != nil {
		t.Fatal(err)
	}
	if !state.On || state.Brightness != 77 {
		t.Fatalf("unexpected display state: %+v", state)
	}

	if err := os.WriteFile(brightnessFile, []byte("bad"), 0644); err != nil {
		t.Fatal(err)
	}
	if _, err := c.currentDisplayState(); err == nil {
		t.Fatal("expected invalid brightness file to return an error")
	}
}

func TestDisplayFileOperationErrors(t *testing.T) {
	t.Parallel()

	missingFile := filepath.Join(t.TempDir(), "missing")
	c := &Controller{
		PowerFile:      missingFile,
		BrightnessFile: missingFile,
	}

	if _, err := c.currentDisplayState(); err == nil {
		t.Fatal("expected missing power file to return an error")
	}
	if _, err := c.getBrightness(); err == nil {
		t.Fatal("expected missing brightness file to return an error")
	}
	c.BrightnessFile = t.TempDir()
	if err := c.setBrightness(12); err == nil {
		t.Fatal("expected directory brightness path to return an error")
	}
}

func TestCPUTemperatureDevMode(t *testing.T) {
	t.Parallel()

	c := &Controller{
		config: Config{DevMode: true},
	}
	temp, err := c.CPUTemperature()
	if err != nil {
		t.Fatal(err)
	}
	if temp != "23.23 " {
		t.Fatalf("expected dev-mode temperature, got %q", temp)
	}
}
