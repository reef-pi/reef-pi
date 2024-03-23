package doser

import (
	"log"
	"time"
	"bytes"
    "fmt"
    "text/template"
	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"net/http"
)

type Runner struct {
	pump     *Pump
	dm       *device_manager.DeviceManager
	statsMgr telemetry.StatsManager
	t        telemetry.Telemetry
}

type Restdoser struct {
	Url      string   `json:"url"`
	CalUrl   string   `json:"calUrl"`
}

func (r *Runner) Run() {

	usage := Usage{
		Time: telemetry.TeleTime(time.Now()),
	}
	if r.pump.Type == "stepper" && r.pump.Stepper != nil {
		log.Println("doser sub system: running doser(stepper)", r.pump.Name, "for", r.pump.Regiment.Volume, "(ml)")
		if err := r.pump.Stepper.Dose(r.dm.Outlets(), r.pump.Regiment.Volume); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to run stepper. Error:", err)
			return
		}
		usage.Pump = int(r.pump.Regiment.Duration)
	} else if r.pump.Type == "restdoser" {
	    log.Println(r.pump.Restdoser.Url)
		log.Println("doser sub system: running doser(REST Doser)", r.pump.Name, "for", r.pump.Regiment.Volume, "(ml)",  r.pump.Regiment.Duration, "(s)")
	    if err := r.RESTDose(r.pump.Restdoser.Url, r.pump.Regiment.Volume, r.pump.Regiment.Duration, r.pump.Regiment.Speed); err != nil {
	        log.Printf("ERROR: dosing sub-system. Failed to control REST pump. Error:", err)
	    }
		usage.Pump = int(r.pump.Regiment.Duration)
	} else {
		log.Println("doser sub system: running doser(dcmotor)", r.pump.Name, "at", r.pump.Regiment.Speed, "%speed for", r.pump.Regiment.Duration, "(s)")
		if err := r.PWMDose(r.pump.Regiment.Speed, r.pump.Regiment.Duration); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
			return
		}
		usage.Pump = int(r.pump.Regiment.Duration)
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	r.t.EmitMetric("doser", r.pump.Name+"-usage", float64(usage.Pump))
	log.Println("dosing sub system: finished scheduled run for:", r.pump.Name)
}

func (r *Runner) PWMDose(speed float64, duration float64) error {
	v := make(map[int]float64)
	v[r.pump.Pin] = speed
	if err := r.dm.Jacks().Control(r.pump.Jack, v); err != nil {
		return err
	}
	select {
	case <-time.After(time.Duration(duration * float64(time.Second))):
		v[r.pump.Pin] = 0
		return r.dm.Jacks().Control(r.pump.Jack, v)
	}
}


func (r *Runner) RESTDose(urlTemplate string, volume float64, duration float64, speed float64) error {
    // Define a template with placeholders
    tmpl, err := template.New("urlTemplate").Parse(urlTemplate)
    if err != nil {
        return fmt.Errorf("error parsing URL template: %v", err)
    }

    // Prepare data to be injected into the template
    data := struct {
        Volume   float64
        Duration float64
        Speed float64
    }{
        Volume:   volume,
        Duration: duration,
        Speed:    speed,
    }

    // Execute the template to generate the final URL
    var buf bytes.Buffer
    if err := tmpl.Execute(&buf, data); err != nil {
        return fmt.Errorf("error executing URL template: %v", err)
    }

    // Extract the URL from the buffer
    url := buf.String()

    // Now use the generated URL to make the GET request
    log.Printf("Send REST command to Doser %s", url)

    resp, err := http.Get(url)
    if err != nil {
        return fmt.Errorf("error making GET request: %v", err)
    }
    defer resp.Body.Close()

    // Check the response status code
    if resp.StatusCode != http.StatusOK {
        return fmt.Errorf("unexpected status code: %v", resp.StatusCode)
    }

    return nil
}
