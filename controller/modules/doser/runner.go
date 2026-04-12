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

const _softStartSteps = 10

func (r *Runner) PWMDose(speed float64, duration float64) error {
	v := make(map[int]float64)
	softStart := r.pump.Regiment.SoftStart
	if softStart > 0 {
		stepDur := time.Duration(softStart / _softStartSteps * float64(time.Second))
		for i := 1; i <= _softStartSteps; i++ {
			v[r.pump.Pin] = speed * float64(i) / _softStartSteps
			if err := r.dm.Jacks().Control(r.pump.Jack, v); err != nil {
				return err
			}
			time.Sleep(stepDur)
		}
	} else {
		v[r.pump.Pin] = speed
		if err := r.dm.Jacks().Control(r.pump.Jack, v); err != nil {
			return err
		}
	}
	time.Sleep(time.Duration(duration * float64(time.Second)))
	if softStart > 0 {
		stepDur := time.Duration(softStart / _softStartSteps * float64(time.Second))
		for i := _softStartSteps - 1; i >= 0; i-- {
			v[r.pump.Pin] = speed * float64(i) / _softStartSteps
			if err := r.dm.Jacks().Control(r.pump.Jack, v); err != nil {
				return err
			}
			time.Sleep(stepDur)
		}
		return nil
	}
	v[r.pump.Pin] = 0
	return r.dm.Jacks().Control(r.pump.Jack, v)
}
