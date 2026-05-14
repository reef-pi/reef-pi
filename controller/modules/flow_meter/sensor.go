package flow_meter

import (
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

const sensorBaseDir = "/sys/class/gpio"

func validateSensorPath(path string) (string, error) {
	if strings.TrimSpace(path) == "" {
		return "", fmt.Errorf("sensor path cannot be empty")
	}

	baseAbs, err := filepath.Abs(sensorBaseDir)
	if err != nil {
		return "", fmt.Errorf("resolving sensor base directory %q: %w", sensorBaseDir, err)
	}

	resolved, err := filepath.Abs(filepath.Join(baseAbs, path))
	if err != nil {
		return "", fmt.Errorf("resolving sensor path %q: %w", path, err)
	}

	rel, err := filepath.Rel(baseAbs, resolved)
	if err != nil {
		return "", fmt.Errorf("checking sensor path %q: %w", path, err)
	}
	if rel == ".." || strings.HasPrefix(rel, ".."+string(os.PathSeparator)) {
		return "", fmt.Errorf("sensor path %q escapes base directory %q", path, sensorBaseDir)
	}

	return resolved, nil
}

func (c *Controller) readPulseCount(path string) (int64, error) {
	if c.devMode {
		c.Lock()
		last := c.lastCounts["_dev"]
		c.lastCounts["_dev"] = last + int64(rand.Intn(500)+200)
		count := c.lastCounts["_dev"]
		c.Unlock()
		return count, nil
	}

	validatedPath, err := validateSensorPath(path)
	if err != nil {
		return 0, err
	}

	data, err := os.ReadFile(validatedPath)
	if err != nil {
		return 0, fmt.Errorf("reading pulse count file %q: %w", validatedPath, err)
	}
	s := strings.TrimSpace(string(data))
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parsing pulse count from %q: %w", validatedPath, err)
	}
	return n, nil
}
