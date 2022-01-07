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
}

func (r *Runner) Run() {
	log.Println("doser sub system: scheduled run ", r.pump.Name)
	usage := Usage{
		Time: telemetry.TeleTime(time.Now()),
	}
	if r.pump.Stepper != nil {
		if err := r.PWMDose(r.pump.Regiment.Speed, r.pump.Regiment.Duration); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
			return
		}
		usage.Pump = int(r.pump.Regiment.Duration)
	} else {
		if err := r.pump.Stepper.Dose(r.dm.Outlets(), r.pump.Regiment.Volume); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to run stepper. Error:", err)
			return
		}
		usage.Pump = int(r.pump.Regiment.Duration)
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	//r.c.Telemetry().EmitMetric("doser_"+r.pump.Name+"_usage", usage.Pump)
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
