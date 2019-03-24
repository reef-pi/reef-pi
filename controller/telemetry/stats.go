package telemetry

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"

	"github.com/reef-pi/reef-pi/controller/storage"

	"math"

	"github.com/reef-pi/adafruitio"
)

const DBKey = "telemetry"

func TwoDecimal(f float64) float64 {
	return math.Round(f*100) / 100
}

type ErrorLogger func(string, string) error

type Telemetry interface {
	Alert(string, string) (bool, error)
	EmitMetric(string, string, float64)
	CreateFeedIfNotExist(string)
	DeleteFeedIfExist(string)
	NewStatsManager(storage.Store, string) StatsManager
	SendTestMessage(http.ResponseWriter, *http.Request)
	GetConfig(http.ResponseWriter, *http.Request)
	UpdateConfig(http.ResponseWriter, *http.Request)
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

type TelemetryConfig struct {
	AdafruitIO      AdafruitIO   `json:"adafruitio"`
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
}

type telemetry struct {
	client     *adafruitio.Client
	dispatcher Mailer
	config     TelemetryConfig
	aStats     map[string]AlertStats
	mu         *sync.Mutex
	logError   ErrorLogger
	store      storage.Store
	bucket     string
	pMs        map[string]prometheus.Gauge
}

func Initialize(b string, store storage.Store, logError ErrorLogger, prom bool) Telemetry {
	var c TelemetryConfig
	if err := store.Get(b, DBKey, &c); err != nil {
		log.Println("ERROR: Failed to load telemtry config from saved settings. Initializing")
		c = DefaultTelemetryConfig
		store.Update(b, DBKey, c)
	}
	c.Prometheus = prom
	// for upgrades, this value will be 0. Remove in 3.0
	if c.HistoricalLimit < 1 {
		c.HistoricalLimit = HistoricalLimit
	}
	if c.CurrentLimit < 1 {
		c.CurrentLimit = CurrentLimit
	}
	return NewTelemetry(b, store, c, logError)
}

func NewTelemetry(b string, store storage.Store, config TelemetryConfig, lr ErrorLogger) *telemetry {
	var mailer Mailer
	mailer = &NoopMailer{}
	if config.Notify {
		mailer = config.Mailer.Mailer()
	}
	return &telemetry{
		client:     adafruitio.NewClient(config.AdafruitIO.Token),
		config:     config,
		dispatcher: mailer,
		aStats:     make(map[string]AlertStats),
		mu:         &sync.Mutex{},
		logError:   lr,
		store:      store,
		bucket:     b,
		pMs:        make(map[string]prometheus.Gauge),
	}
}

func (t *telemetry) NewStatsManager(store storage.Store, b string) StatsManager {
	return &mgr{
		inMemory:        make(map[string]Stats),
		bucket:          b,
		store:           store,
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

func (t *telemetry) Alert(subject, body string) (bool, error) {
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

func (t *telemetry) EmitMetric(module, name string, v float64) {
	feed := module + "-" + name
	aio := t.config.AdafruitIO
	feed = strings.ToLower(aio.Prefix + feed)

	if t.config.Prometheus {
		t.mu.Lock()
		g, ok := t.pMs[feed]
		if !ok {
			g = promauto.NewGauge(prometheus.GaugeOpts{
				Name: feed,
				Help: feed,
			})
			t.pMs[feed] = g
		}
		t.mu.Unlock()
		g.Add(v)
	}
	if !aio.Enable {
		//log.Println("Telemetry disabled. Skipping emitting", v, "on", feed)
		return
	}
	d := adafruitio.Data{
		Value: v,
	}
	if err := t.client.SubmitData(aio.User, feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. User: ", aio.User, "Feed:", feed, "Error:", err)
		t.logError("telemtry-"+feed, err.Error())
	}
}

func (t *telemetry) CreateFeedIfNotExist(f string) {
	aio := t.config.AdafruitIO
	f = strings.ToLower(aio.Prefix + f)
	if !aio.Enable {
		//log.Println("Telemetry disabled. Skipping creating feed:", f)
		return
	}
	feed := adafruitio.Feed{
		Name:    f,
		Key:     f,
		Enabled: true,
	}
	if _, err := t.client.GetFeed(aio.User, f); err != nil {
		log.Println("Telemetry sub-system: Creating missing feed:", f)
		if e := t.client.CreateFeed(aio.User, feed); e != nil {
			log.Println("ERROR: Telemetry sub-system: Failed to create feed:", f, "Error:", e)
		}
	}
	return
}

type TeleTime time.Time

const format = "Jan-02-15:04"

func (t TeleTime) Before(t2 TeleTime) bool {
	return time.Time(t).Before(time.Time(t2))
}

func (t TeleTime) Hour() int {
	return time.Time(t).Hour()
}

func (t TeleTime) Day() int {
	return time.Time(t).Day()
}

func (t TeleTime) MarshalJSON() ([]byte, error) {
	b := make([]byte, 0, len(format)+2)
	b = append(b, '"')
	b = time.Time(t).AppendFormat(b, format)
	b = append(b, '"')
	return b, nil
}

func (t *TeleTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		return nil
	}
	t1, err := time.Parse(`"`+format+`"`, string(data))
	if err != nil {
		return err
	}
	*t = TeleTime(t1)
	return nil
}

func (t *telemetry) DeleteFeedIfExist(f string) {
	aio := t.config.AdafruitIO
	f = strings.ToLower(aio.Prefix + f)
	if !aio.Enable {
		//log.Println("Telemetry disabled. Skipping creating feed:", f)
		return
	}
	log.Println("Telemetry sub-system: Deleting feed:", f)
	if err := t.client.DeleteFeed(aio.User, f); err != nil {
		log.Println("ERROR: Telemetry sub-system: Failed to delete feed:", f, "Error:", err)
	}
	return
}
