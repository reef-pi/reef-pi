package telemetry

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/reef-pi/adafruitio"

	"github.com/reef-pi/reef-pi/controller/storage"
)

const DBKey = "telemetry"

var sanitizePrometheusMetricRegex = regexp.MustCompile("[^a-zA-Z0-9_]")

// adafruitIOFeedKeyRegex strips any character that is not a lowercase letter,
// digit, or hyphen — the only characters accepted in Adafruit IO feed keys.
var adafruitIOFeedKeyRegex = regexp.MustCompile("[^a-z0-9-]")

// consecutiveDashRegex collapses multiple adjacent hyphens into one.
var consecutiveDashRegex = regexp.MustCompile("-{2,}")

type ErrorLogger func(string, string) error

type Telemetry interface {
	Alert(string, string) (bool, error)
	Mail(string, string) (bool, error)
	EmitMetric(string, string, float64)
	CreateFeedIfNotExist(string)
	DeleteFeedIfExist(string)
	NewStatsManager(string) StatsManager
	SendTestMessage(http.ResponseWriter, *http.Request)
	GetConfig(http.ResponseWriter, *http.Request)
	UpdateConfig(http.ResponseWriter, *http.Request)
	LogError(string, string) error
}

type AlertStats struct {
	Count        int       `json:"count"`
	FirstTrigger time.Time `json:"first_trigger"`
}

type AdafruitIO struct {
	Enable bool   `json:"enable"`
	Token  string `json:"token"`
	User   string `json:"user"`
	Prefix string `json:"prefix"`
}

//swagger:model telemetryConfig
type TelemetryConfig struct {
	AdafruitIO      AdafruitIO   `json:"adafruitio"`
	MQTT            MQTTConfig   `json:"mqtt"`
	Mailer          MailerConfig `json:"mailer"`
	Notify          bool         `json:"notify"`
	Prometheus      bool         `json:"prometheus"`
	Throttle        int          `json:"throttle"`
	HistoricalLimit int          `json:"historical_limit"`
	CurrentLimit    int          `json:"current_limit"`
}

var DefaultTelemetryConfig = TelemetryConfig{
	Mailer:          GMailMailer,
	Throttle:        10,
	CurrentLimit:    CurrentLimit,
	HistoricalLimit: HistoricalLimit,
	MQTT:            DefaultMQTTConfig,
}

type telemetry struct {
	name       string
	aClient    *adafruitio.Client
	mClient    *MQTTClient
	dispatcher Mailer
	config     TelemetryConfig
	aStats     map[string]AlertStats
	mu         *sync.Mutex
	logError   ErrorLogger
	store      storage.Store
	bucket     string
	configRepo *telemetryConfigRepository
	pMs        map[string]prometheus.Gauge
}

func Initialize(name, bucket string, store storage.Store, logError ErrorLogger, prom bool) Telemetry {
	repo := newTelemetryConfigRepository(store, bucket)
	c, err := repo.get()
	if err != nil {
		log.Println("ERROR: Failed to load telemetry config from saved settings. Initializing")
		c = DefaultTelemetryConfig
		repo.update(c)
	}
	c.Prometheus = prom
	// for upgrades, this value will be 0. Remove in 3.0
	if c.HistoricalLimit < 1 {
		c.HistoricalLimit = HistoricalLimit
	}
	if c.CurrentLimit < 1 {
		c.CurrentLimit = CurrentLimit
	}
	return NewTelemetry(name, bucket, store, c, logError)
}

func NewTelemetry(name, bucket string, store storage.Store, config TelemetryConfig, lr ErrorLogger) *telemetry {
	var mailer Mailer
	mailer = &NoopMailer{}
	if config.Notify {
		mailer = config.Mailer.Mailer()
	}
	t := &telemetry{
		name:       name,
		config:     config,
		dispatcher: mailer,
		aStats:     make(map[string]AlertStats),
		mu:         &sync.Mutex{},
		logError:   lr,
		store:      store,
		bucket:     bucket,
		configRepo: newTelemetryConfigRepository(store, bucket),
		pMs:        make(map[string]prometheus.Gauge),
	}
	if config.AdafruitIO.Enable {
		t.aClient = adafruitio.NewClient(config.AdafruitIO.Token)
	}
	if config.MQTT.Enable {
		mClient, err := NewMQTTClient(config.MQTT)
		if err != nil {
			lr("telemetry-subsystem", "Failed to initialize mqtt client:"+err.Error())
			// Network may not be ready at boot (DHCP/DNS still pending). Retry in background.
			go t.mqttReconnectLoop()
		} else {
			t.mClient = mClient
		}
	}
	return t
}

// mqttReconnectLoop retries the MQTT connection every 30 seconds until it
// succeeds or MQTT is disabled. It is started as a goroutine when the initial
// connection attempt at startup fails (common on Pi due to network not being
// ready before reef-pi starts).
func (t *telemetry) mqttReconnectLoop() {
	for {
		time.Sleep(30 * time.Second)
		t.mu.Lock()
		enabled := t.config.MQTT.Enable
		already := t.mClient != nil
		t.mu.Unlock()
		if !enabled || already {
			return
		}
		mClient, err := NewMQTTClient(t.config.MQTT)
		if err != nil {
			log.Println("WARNING: telemetry: mqtt reconnect failed:", err)
			continue
		}
		t.mu.Lock()
		if t.mClient == nil { // check again in case applyConfig ran concurrently
			t.mClient = mClient
			log.Println("INFO: telemetry: mqtt client reconnected successfully")
		} else {
			mClient.client.Disconnect(250) // applyConfig already set a new one
		}
		t.mu.Unlock()
		return
	}
}

func (t *telemetry) NewStatsManager(b string) StatsManager {
	return &mgr{
		inMemory:        make(map[string]Stats),
		bucket:          b,
		store:           t.store,
		HistoricalLimit: t.config.HistoricalLimit,
		CurrentLimit:    t.config.CurrentLimit,
	}
}

func (t *telemetry) updateAlertStats(subject string) AlertStats {
	now := time.Now()
	t.mu.Lock()
	defer t.mu.Unlock()
	stat, ok := t.aStats[subject]
	if !ok {
		stat.FirstTrigger = now
		stat.Count = 1
		t.aStats[subject] = stat
		return stat
	}
	if stat.FirstTrigger.Hour() == now.Hour() {
		stat.Count++
		t.aStats[subject] = stat
		return stat
	}
	stat.FirstTrigger = now
	stat.Count = 1
	t.aStats[subject] = stat
	return stat
}

func (t *telemetry) LogError(a, b string) error {
	t.EmitMetric(a, "error", 1)
	return t.logError(a, b)
}

func (t *telemetry) Alert(subject, body string) (bool, error) {
	prefix := "[" + t.name + ":Alert]"
	t.logError("alert:"+subject, subject)
	return t.Mail(prefix+subject, body)
}

func (t *telemetry) Mail(subject, body string) (bool, error) {
	stat := t.updateAlertStats(subject)
	if (t.config.Throttle > 0) && (stat.Count > t.config.Throttle) {
		log.Println("WARNING: Alert is above throttle limits. Skipping. Subject:", subject)
		return false, nil
	}
	if err := t.dispatcher.Email(subject, body); err != nil {
		log.Println("ERROR: Failed to dispatch alert:", subject, "Error:", err)
		t.logError("alert-failure", err.Error())
		return false, err
	}
	return true, nil
}

func SanitizeAdafruitIOFeedName(name string) string {
	name = strings.ToLower(name)
	// Replace spaces with dashes first, then strip all remaining characters
	// that Adafruit IO does not allow in feed keys (only a-z, 0-9, hyphen).
	name = strings.ReplaceAll(name, " ", "-")
	name = adafruitIOFeedKeyRegex.ReplaceAllString(name, "")
	// Collapse consecutive hyphens that result from stripping characters such
	// as parentheses, colons, etc.  e.g. "foo-(bar)-baz" → "foo-bar-baz".
	name = consecutiveDashRegex.ReplaceAllString(name, "-")
	// Trim any leading/trailing hyphens.
	return strings.Trim(name, "-")
}
func SanitizePrometheusMetricName(name string) string {
	name = strings.ToLower(name)
	name = sanitizePrometheusMetricRegex.ReplaceAllString(name, "_")
	return name
}

func (t *telemetry) EmitMetric(module, name string, v float64) {
	aio := t.config.AdafruitIO
	pName := SanitizePrometheusMetricName(module + "_" + name)

	if t.config.Prometheus {
		t.mu.Lock()
		g, ok := t.pMs[pName]
		if !ok {
			g = promauto.NewGauge(prometheus.GaugeOpts{
				Name: pName,
				Help: "Module:" + module + " Item:" + name,
			})
			t.pMs[pName] = g
		}
		t.mu.Unlock()
		g.Set(v)
	}
	if aio.Enable {
		aFeed := SanitizeAdafruitIOFeedName(aio.Prefix + module + "-" + name)
		if err := t.EmitAIO(aio.User, aFeed, v); err != nil {
			log.Println("ERROR: Failed to submit data to adafruit.io. User: ", aio.User, "Feed:", aFeed, "Error:", err)
			t.logError("telemetry-"+aFeed, err.Error())
		}
	}
	if t.config.MQTT.Enable {
		if err := t.EmitMQTT(pName, v); err != nil {
			log.Println("ERROR: Failed to publish data via mqtt. Error:", err)
			t.logError("telemetry-mqtt", err.Error())
		}
	}
}

func (t *telemetry) EmitMQTT(topic string, v float64) error {
	t.mu.Lock()
	client := t.mClient
	t.mu.Unlock()
	if client == nil {
		return errors.New("mqtt client is not initialized")
	}
	return client.Publish(topic, fmt.Sprintf("%f", v))
}

func (t *telemetry) EmitAIO(user, feed string, v float64) error {
	return t.aClient.SubmitData(user, feed,
		adafruitio.Data{
			Value: v,
		})
}

func (t *telemetry) CreateFeedIfNotExist(f string) {
	aio := t.config.AdafruitIO
	if !aio.Enable {
		//log.Println("Telemetry disabled. Skipping creating feed:", f)
		return
	}
	f = SanitizeAdafruitIOFeedName(aio.Prefix + f)
	feed := adafruitio.Feed{
		Name:    f,
		Key:     f,
		Enabled: true,
	}
	if _, err := t.aClient.GetFeed(aio.User, f); err != nil {
		log.Println("Telemetry sub-system: Creating missing feed:", f)
		if e := t.aClient.CreateFeed(aio.User, feed); e != nil {
			log.Println("ERROR: Telemetry sub-system: Failed to create feed:", f, "Error:", e)
		}
	}
}

func (t *telemetry) applyConfig(c TelemetryConfig) {
	var newDispatcher Mailer
	if c.Notify {
		newDispatcher = c.Mailer.Mailer()
	} else {
		newDispatcher = &NoopMailer{}
	}
	var newAClient *adafruitio.Client
	if c.AdafruitIO.Enable {
		newAClient = adafruitio.NewClient(c.AdafruitIO.Token)
	}
	var newMClient *MQTTClient
	if c.MQTT.Enable {
		mc, err := NewMQTTClient(c.MQTT)
		if err != nil {
			log.Println("ERROR: Failed to reinitialize MQTT client after config update:", err)
		} else {
			newMClient = mc
		}
	}
	t.mu.Lock()
	oldMClient := t.mClient
	t.config = c
	t.mClient = newMClient
	t.mu.Unlock()
	t.dispatcher = newDispatcher
	t.aClient = newAClient
	if oldMClient != nil {
		oldMClient.client.Disconnect(250)
	}
}

func (t *telemetry) DeleteFeedIfExist(f string) {
	aio := t.config.AdafruitIO
	f = strings.ToLower(aio.Prefix + f)
	if !aio.Enable {
		return
	}
	log.Println("Telemetry sub-system: Deleting feed:", f)
	if err := t.aClient.DeleteFeed(aio.User, f); err != nil {
		log.Println("ERROR: Telemetry sub-system: Failed to delete feed:", f, "Error:", err)
	}
}
