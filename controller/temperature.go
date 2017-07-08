package controller

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type TemperatureSensor struct {
	hours     []int
	minutes   []int
	stopCh    chan struct{}
	telemetry *Telemetry
}

func detectTempSensorDevice() (string, error) {
	// TODO detect ds18b20 device path
	files, err := filepath.Glob("/sys/bus/w1/devices/28-*")
	if err != nil {
		return "", err
	}
	if len(files) != 1 {
		return "", fmt.Errorf("More than one device found (%d)", len(files))
	}
	return files[0], nil
}

func NewTemperatureSensor(telemetry *Telemetry) *TemperatureSensor {
	return &TemperatureSensor{
		hours:     make([]int, 24),
		minutes:   make([]int, 60),
		telemetry: telemetry,
	}
}

func (t *TemperatureSensor) Hours() []int {
	return t.hours
}

func (t *TemperatureSensor) Minutes() []int {
	return t.minutes
}

func (t *TemperatureSensor) Start() {
	log.Println("Starting temperature sensor")
	hourly := time.NewTicker(time.Hour)
	minutely := time.NewTicker(time.Minute)
	for {
		select {
		case <-minutely.C:
			reading, err := t.Read()
			if err != nil {
				log.Println("ERROR: Failed to read temperature. Error:", err)
				continue
			}
			log.Println("Temperature sensor value:", reading)
			t.telemetry.EmitMetric("temperature", reading)
			t.minutes[time.Now().Minute()] = reading
		case <-hourly.C:
			reading, err := t.Read()
			if err != nil {
				log.Println("ERROR: Failed to read temperature. Error:", err)
				continue
			}
			t.hours[time.Now().Hour()] = reading
		case <-t.stopCh:
			log.Println("Stopping temperature sensor")
			hourly.Stop()
			minutely.Stop()
			return
		}
	}
}

func (t *TemperatureSensor) Stop() {
	t.stopCh <- struct{}{}
}

func (t *TemperatureSensor) Read() (int, error) {
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

func readTemperature(fi io.Reader) (int, error) {
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
	return v, nil
}

func (c *Controller) GetTemperature() (readings []int) {
	if c.config.EnableTemperatureSensor {
		readings = c.state.tSensor.Minutes()
	}
	return
}
