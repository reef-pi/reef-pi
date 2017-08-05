package lighting

import (
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Lighting struct {
	stopCh    chan struct{}
	Interval  time.Duration
	Channels  map[string]LEDChannel
	telemetry *utils.Telemetry
}

func New(channels map[string]LEDChannel, telemetry *utils.Telemetry) *Lighting {
	interval := time.Second * 15
	return &Lighting{
		Channels:  channels,
		Interval:  interval,
		telemetry: telemetry,
	}
}

func (l *Lighting) StartCycle(pwm *utils.PWM, conf CycleConfig) {
	l.stopCh = make(chan struct{})
	ticker := time.NewTicker(l.Interval)
	log.Println("Starting lighting cycle")
	for {
		select {
		case <-l.stopCh:
			ticker.Stop()
			close(l.stopCh)
			l.stopCh = nil
			return
		case <-ticker.C:
			for chName, ch := range l.Channels {
				expectedValues, ok := conf.ChannelValues[chName]
				if !ok {
					log.Printf("ERROR: Could not find channel '%s' 24 hour cycle values\n", chName)
					continue
				}
				v := GetCurrentValue(time.Now(), expectedValues)
				if (ch.MinTheshold > 0) && (v < ch.MinTheshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is below minimum threshold(%d). Resetting to 0\n", v, chName, ch.MinTheshold)
					v = 0
				} else if (ch.MaxThreshold > 0) && (v > ch.MaxThreshold) {
					log.Printf("Lighting: Calculated value(%d) for channel '%s' is above maximum threshold(%d). Resetting to %d\n", v, chName, ch.MaxThreshold, ch.MaxThreshold)
					v = ch.MaxThreshold
				}
				l.UpdateChannel(pwm, ch.Pin, v)
				if l.telemetry != nil {
					l.telemetry.EmitMetric(chName, v)
				}
			}
		}
	}
}

func (l *Lighting) StopCycle() {
	if l.stopCh == nil {
		log.Println("WARNING: stop channel is not initialized.")
		return
	}
	l.stopCh <- struct{}{}
	log.Println("Stopped lighting cycle")
}

func (l *Lighting) UpdateChannel(pwm *utils.PWM, pin, v int) {
	log.Println("Setting pwm value:", v, " at pin:", pin)
	pwm.Set(pin, v)
}
func (l *Lighting) Reconfigure(pwm *utils.PWM, conf Config) {
	if conf.Cycle.Enabled {
		go l.StartCycle(pwm, conf.Cycle)
		return
	}
	for chName, ch := range l.Channels {
		l.UpdateChannel(pwm, ch.Pin, conf.Fixed[chName])
	}
}
