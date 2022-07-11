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
