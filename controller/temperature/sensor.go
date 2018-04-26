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

func (c *Controller) Read(tc TC) (float32, error) {
	if c.devMode {
		log.Println("Temperature controller is running in dev mode, skipping sensor reading.")
		if tc.Fahrenheit {
			return twoDecimal(78.0 + (3 * rand.Float32())), nil
		} else {
			return twoDecimal(24.4 + (1.5 * rand.Float32())), nil
		}
	}
	log.Println("Reading temperature from device:", tc.Sensor)
	fi, err := os.Open(filepath.Join("/sys/bus/w1/devices", tc.Sensor))
	if err != nil {
		return -1, err
	}
	defer fi.Close()
	return tc.readTemperature(fi)
}

func (t *TC) readTemperature(fi io.Reader) (float32, error) {
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
	temp := float32(v) / 1000.0
	if t.Fahrenheit {
		temp = ((temp * 9.0) / 5.0) + 32.0
	}

	return temp, nil
}
