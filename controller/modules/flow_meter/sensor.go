package flow_meter

import (
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

func (c *Controller) readPulseCount(path string) (int64, error) {
	if c.devMode {
		c.Lock()
		last := c.lastCounts["_dev"]
		c.lastCounts["_dev"] = last + int64(rand.Intn(500)+200)
		count := c.lastCounts["_dev"]
		c.Unlock()
		return count, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return 0, fmt.Errorf("reading pulse count file %q: %w", path, err)
	}
	s := strings.TrimSpace(string(data))
	n, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parsing pulse count from %q: %w", path, err)
	}
	return n, nil
}
