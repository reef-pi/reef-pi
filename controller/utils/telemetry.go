package utils

import (
	"github.com/reef-pi/adafruitio"
	"log"
	"strings"
	"time"
)

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
	AdafruitIO AdafruitIO   `json:"adafruitio"`
	Mailer     MailerConfig `json:"mailer"`
	Notify     bool         `json:"notify"`
	Throttle   int          `json:"throttle"`
}

var DefaultTelemetryConfig = TelemetryConfig{
	Mailer:   GMailMailer,
	Throttle: 10,
}

type Telemetry struct {
	client     *adafruitio.Client
	dispatcher Mailer
	config     TelemetryConfig
	aStats     map[string]AlertStats
}

func NewTelemetry(config TelemetryConfig) *Telemetry {
	var mailer Mailer
	mailer = &NoopMailer{}
	if config.Notify {
		mailer = config.Mailer.Mailer()
	}
	return &Telemetry{
		client:     adafruitio.NewClient(config.AdafruitIO.Token),
		config:     config,
		dispatcher: mailer,
		aStats:     make(map[string]AlertStats),
	}
}

func (t *Telemetry) updateAlertStats(subject string) AlertStats {
	now := time.Now()
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

func (t *Telemetry) Alert(subject, body string) (bool, error) {
	stat := t.updateAlertStats(subject)
	if (t.config.Throttle > 0) && (stat.Count > t.config.Throttle) {
		log.Println("WARNING: Alert is above throttle limits. Skipping. Subject:", subject)
		return false, nil
	}
	if err := t.dispatcher.Email(subject, body); err != nil {
		log.Println("ERROR: Failed to dispatch alert:", subject, "Error:", err)
		return false, err
	}
	return true, nil
}

func (t *Telemetry) EmitMetric(feed string, v interface{}) {
	aio := t.config.AdafruitIO
	feed = strings.ToLower(aio.Prefix + feed)
	if !aio.Enable {
		//log.Println("Telemetry disabled. Skipping emitting", v, "on", feed)
		return
	}
	d := adafruitio.Data{
		Value: v,
	}
	if err := t.client.SubmitData(aio.User, feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. User: ", aio.User, "Feed:", feed, "Error:", err)
	}
}

func (t *Telemetry) CreateFeedIfNotExist(f string) {
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
