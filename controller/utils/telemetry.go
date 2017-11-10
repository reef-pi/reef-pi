package utils

import (
	"github.com/reef-pi/adafruitio"
	"log"
	"strings"
	"time"
)

type AdafruitIO struct {
	Enable bool   `json:"enable" yaml:"enable"`
	Token  string `json:"token" yaml:"token"`
	User   string `json:"user" yaml:"user"`
	Prefix string `json:"prefix" yaml:"prefix"`
}

type Telemetry struct {
	client     *adafruitio.Client
	dispatcher Mailer
	config     AdafruitIO
}

func NewTelemetry(config AdafruitIO, m Mailer) *Telemetry {
	return &Telemetry{
		client:     adafruitio.NewClient(config.Token),
		config:     config,
		dispatcher: m,
	}
}

func (t *Telemetry) Alert(subject, body string) {
	if err := t.dispatcher.Email(subject, body); err != nil {
		log.Println("ERROR: Failed to dispatch alert:", subject, "Error:", err)
	}
}

func (t *Telemetry) EmitMetric(feed string, v interface{}) {
	feed = strings.ToLower(t.config.Prefix + feed)
	if !t.config.Enable {
		log.Println("Telemetry disabled. Skipping emitting", v, "on", feed)
		return
	}
	d := adafruitio.Data{
		Value: v,
	}
	if err := t.client.SubmitData(t.config.User, feed, d); err != nil {
		log.Println("ERROR: Failed to submit data to adafruit.io. User: ", t.config.User, "Feed:", feed, "Error:", err)
	}
}

func (t *Telemetry) CreateFeedIfNotExist(f string) {
	f = strings.ToLower(t.config.Prefix + f)
	if !t.config.Enable {
		log.Println("Telemetry disabled. Skipping creating feed:", f)
		return
	}
	feed := adafruitio.Feed{
		Name:    f,
		Key:     f,
		Enabled: true,
	}
	if _, err := t.client.GetFeed(t.config.User, f); err != nil {
		log.Println("Telemetry sub-system: Creating missing feed:", f)
		if e := t.client.CreateFeed(t.config.User, feed); e != nil {
			log.Println("ERROR: Telemetry sub-system: Failed to create feed:", f, "Error:", e)
		}
	}
	return
}

type TeleTime time.Time

func (t TeleTime) Before(t2 TeleTime) bool {
	return time.Time(t).Before(time.Time(t2))
}

func (t TeleTime) Hour() int {
	return time.Time(t).Hour()
}

func (t TeleTime) MarshalJSON() ([]byte, error) {
	format := "Jan-02-15:04"
	b := make([]byte, 0, len(format)+2)
	b = append(b, '"')
	b = time.Time(t).AppendFormat(b, format)
	b = append(b, '"')
	return b, nil
}
