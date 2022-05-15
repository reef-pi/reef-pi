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

	"github.com/reef-pi/reef-pi/controller/utils"
)

func (c *Controller) Read(tc *TC) (float64, error) {
	log.Println("Reading temperature from device:", tc.Sensor)
	if c.devMode {
		log.Println("Temperature controller is running in dev mode, skipping sensor reading.")
		if tc.Fahrenheit {
			return utils.RoundToTwoDecimal(78.0 + (3 * rand.Float64())), nil
		}

		return utils.RoundToTwoDecimal(24.4 + (1.5 * rand.Float64())), nil
	}

	var v float64
	var err error

	for attempt := 0; attempt <= 3; attempt++ {
		fi, err := os.Open(filepath.Join("/sys/bus/w1/devices", tc.Sensor, "w1_slave"))
		if err != nil {
			return -1, err
		}
		v, err = tc.readTemperature(fi)
		fi.Close()
		if err == nil {
			return v, err
		}
	}

	return v, err
}

func (t *TC) readTemperature(fi io.Reader) (float64, error) {
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
	temp := float64(v) / 1000.0

	if temp < -55 || temp > 125 {
		return -1, fmt.Errorf("temperature reading out of range: -55 < %v < 125", temp)
	}

	if t.Fahrenheit {
		temp = ((temp * 9.0) / 5.0) + 32.0
	}
	return utils.RoundToTwoDecimal(temp), nil
}
