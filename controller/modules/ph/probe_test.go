package ph

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type alertCapture struct {
	subject string
	body    string
}

func (a *alertCapture) Alert(subject, body string) (bool, error) {
	a.subject = subject
	a.body = body
	return true, nil
}
func (a *alertCapture) Mail(_, _ string) (bool, error)                         { return true, nil }
func (a *alertCapture) EmitMetric(_, _ string, _ float64)                      {}
func (a *alertCapture) CreateFeedIfNotExist(_ string)                          {}
func (a *alertCapture) DeleteFeedIfExist(_ string)                             {}
func (a *alertCapture) NewStatsManager(_ string) telemetry.StatsManager        { return nil }
func (a *alertCapture) SendTestMessage(_ http.ResponseWriter, _ *http.Request) {}
func (a *alertCapture) GetConfig(_ http.ResponseWriter, _ *http.Request)       {}
func (a *alertCapture) UpdateConfig(_ http.ResponseWriter, _ *http.Request)    {}
func (a *alertCapture) LogError(_, _ string) error                             { return nil }

func TestNotifyIfNeeded_AlertBodyFormat(t *testing.T) {
	cap := &alertCapture{}
	p := Probe{
		Name: "Tank pH",
		Notify: Notify{
			Enable: true,
			Min:    7.8,
			Max:    8.3,
		},
	}

	notifyIfNeeded(cap, p, 8.5)

	want := fmt.Sprintf("( %s - %s )", "7.8", "8.3")
	if !strings.Contains(cap.body, want) {
		t.Errorf("alert body range format incorrect\ngot:  %q\nwant it to contain: %q", cap.body, want)
	}
	if strings.Contains(cap.body, "( 7.8 -8.3 )") {
		t.Errorf("alert body still has missing space before max value: %q", cap.body)
	}
}
