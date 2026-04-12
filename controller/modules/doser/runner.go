package doser

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Runner struct {
	pump     *Pump
	dm       *device_manager.DeviceManager
	statsMgr telemetry.StatsManager
	t        telemetry.Telemetry
	control  func(string, map[int]float64) error
	sleep    func(time.Duration)
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
	} else {
		duration := r.pump.Regiment.Duration
		if r.pump.Regiment.Volume > 0 && r.pump.Regiment.VolumePerSecond > 0 {
			duration = r.pump.Regiment.Volume / r.pump.Regiment.VolumePerSecond
		}
		log.Println("doser sub system: running doser(dcmotor)", r.pump.Name, "at", r.pump.Regiment.Speed, "%speed for", duration, "(s)")
		if err := r.PWMDose(r.pump.Regiment.Speed, duration); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
			return
		}
		usage.Pump = int(duration)
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	r.t.EmitMetric("doser", r.pump.Name+"-usage", float64(usage.Pump))
	log.Println("dosing sub system: finished scheduled run for:", r.pump.Name)
}

const _softStartSteps = 10

func (r *Runner) controlJack(jack string, values map[int]float64) error {
	if r.control != nil {
		return r.control(jack, values)
	}
	return r.dm.Jacks().Control(jack, values)
}

func (r *Runner) pause(d time.Duration) {
	if r.sleep != nil {
		r.sleep(d)
		return
	}
	time.Sleep(d)
}

func (r *Runner) setPWM(value float64) error {
	return r.controlJack(r.pump.Jack, map[int]float64{r.pump.Pin: value})
}

func (r *Runner) rampPWM(speed float64, start int, end int, step int, stepDur time.Duration) error {
	for i := start; i != end; i += step {
		if err := r.setPWM(speed * float64(i) / _softStartSteps); err != nil {
			return err
		}
		r.pause(stepDur)
	}
	return nil
}

func (r *Runner) PWMDose(speed float64, duration float64) error {
	softStart := r.pump.Regiment.SoftStart
	if softStart > 0 {
		stepDur := time.Duration(softStart / _softStartSteps * float64(time.Second))
		if err := r.rampPWM(speed, 1, _softStartSteps+1, 1, stepDur); err != nil {
			return err
		}
	} else {
		if err := r.setPWM(speed); err != nil {
			return err
		}
	}
	r.pause(time.Duration(duration * float64(time.Second)))
	if softStart > 0 {
		stepDur := time.Duration(softStart / _softStartSteps * float64(time.Second))
		return r.rampPWM(speed, _softStartSteps-1, -1, -1, stepDur)
	}
	return r.setPWM(0)
}
