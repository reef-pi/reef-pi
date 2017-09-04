package temperature

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

func detectTempSensorDevice() (string, error) {
	files, err := filepath.Glob("/sys/bus/w1/devices/28-*")
	if err != nil {
		return "", err
	}
	if len(files) != 1 {
		return "", fmt.Errorf("Only one temperature device expected, found: %d", len(files))
	}
	return filepath.Join(files[0], "w1_slave"), nil
}

func (c *Controller) Read() (float32, error) {
	if c.config.DevMode {
		log.Println("Temperature controller is running in dev mode, skipping sensor reading.")
		return 78.0 + (3 * rand.Float32()), nil
	}
	device, err := detectTempSensorDevice()
	if err != nil {
		return -1, err
	}
	log.Println("Reading temperature from device:", device)
	fi, err := os.Open(device)
	if err != nil {
		return -1, err
	}
	defer fi.Close()
	return readTemperature(fi)
}

func readTemperature(fi io.Reader) (float32, error) {
	reader := bufio.NewReader(fi)
	l1, _, err := reader.ReadLine()
	if err != nil {
		return -1, err
	}
	if !strings.HasSuffix(string(l1), "YES") {
		return -1, fmt.Errorf("First line of device file does not ends with YES")
	}
	l2, _, err := reader.ReadLine()
	if err != nil {
		return -1, err
	}
	vals := strings.Split(string(l2), "=")
	if len(vals) < 2 {
		return -1, fmt.Errorf("Second line of device file does not have '=' separated temperature value")
	}
	v, err := strconv.Atoi(vals[1])
	if err != nil {
		return -1, err
	}
	farenheit := ((float32(v) * 9.0) / 5000.0) + 32.0
	return farenheit, nil
}
