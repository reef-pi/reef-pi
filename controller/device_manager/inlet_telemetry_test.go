package device_manager

import (
	"errors"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/device_manager/connectors"
	"github.com/reef-pi/reef-pi/controller/device_manager/drivers"
	"github.com/reef-pi/reef-pi/controller/storage"
)

type capturedMetric struct {
	module string
	name   string
	value  float64
}

type metricCapture struct {
	metrics  []capturedMetric
	failures int
}

func (m *metricCapture) EmitMetric(module, name string, value float64) {
	m.metrics = append(m.metrics, capturedMetric{module: module, name: name, value: value})
}

func (m *metricCapture) EmitMetricWithStatus(module, name string, value float64) error {
	m.EmitMetric(module, name, value)
	if m.failures > 0 {
		m.failures--
		return errors.New("mqtt publish failed")
	}
	return nil
}

func TestInletStatePublisherPublishesInitialStateAndChangesOnly(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	driverManager := drivers.TestDrivers(store)
	inlets := connectors.NewInlets(driverManager, store)
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := inlets.Create(connectors.Inlet{Name: "Sump Float", Pin: 21, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}

	capture := &metricCapture{}
	publisher := inletStatePublisher{}
	publisher.publish(inlets, capture)
	publisher.publish(inlets, capture)
	item, err := inlets.Get("1")
	if err != nil {
		t.Fatal(err)
	}
	item.Reverse = true
	if err := inlets.Update(item.ID, item); err != nil {
		t.Fatal(err)
	}
	publisher.publish(inlets, capture)

	if len(capture.metrics) != 2 {
		t.Fatalf("expected initial state plus one changed-state metric, got %#v", capture.metrics)
	}
	for idx, expected := range []float64{0, 1} {
		got := capture.metrics[idx]
		if got.module != "inlet" || got.name != "Sump Float-state" || got.value != expected {
			t.Errorf("unexpected inlet state metric at index %d: %#v", idx, got)
		}
	}
}

func TestInletStatePublisherRetriesFailedPublishWithThrottle(t *testing.T) {
	store, err := storage.TestDB()
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()

	driverManager := drivers.TestDrivers(store)
	inlets := connectors.NewInlets(driverManager, store)
	if err := inlets.Setup(); err != nil {
		t.Fatal(err)
	}
	if err := inlets.Create(connectors.Inlet{Name: "Sump Float", Pin: 21, Driver: "rpi"}); err != nil {
		t.Fatal(err)
	}

	capture := &metricCapture{failures: 1}
	publisher := inletStatePublisher{}
	start := time.Unix(100, 0)
	publisher.publishAt(inlets, capture, start)
	publisher.publishAt(inlets, capture, start.Add(time.Second))
	if len(capture.metrics) != 1 {
		t.Fatalf("expected failed publish to be throttled, got %d attempts", len(capture.metrics))
	}

	publisher.publishAt(inlets, capture, start.Add(inletTelemetryRetryInterval))
	publisher.publishAt(inlets, capture, start.Add(2*inletTelemetryRetryInterval))
	if len(capture.metrics) != 2 {
		t.Fatalf("expected one retry followed by steady-state deduplication, got %d attempts", len(capture.metrics))
	}
	if got := capture.metrics[1]; got.module != "inlet" || got.name != "Sump Float-state" || got.value != 0 {
		t.Errorf("unexpected retried inlet state: %#v", got)
	}
}
