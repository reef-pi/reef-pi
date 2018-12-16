package doser

import (
	"log"
	"time"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/telemetry"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type Runner struct {
	pump     *Pump
	jacks    *connectors.Jacks
	statsMgr telemetry.StatsManager
}

func (r *Runner) Dose(speed float64, duration time.Duration) error {
	v := make(map[int]float64)
	v[r.pump.Pin] = speed
	if err := r.jacks.Control(r.pump.Jack, v); err != nil {
		return err
	}
	select {
	case <-time.After(duration * time.Second):
		v[r.pump.Pin] = 0
		if err := r.jacks.Control(r.pump.Jack, v); err != nil {
			return err
		}
	}
	return nil
}

func (r *Runner) Run() {
	log.Println("doser sub system: scheduled run ", r.pump.Name)
	if err := r.Dose(r.pump.Regiment.Speed, r.pump.Regiment.Duration); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	usage := Usage{
		Time: utils.TeleTime(time.Now()),
		Pump: int(r.pump.Regiment.Duration),
	}
	r.statsMgr.Update(r.pump.ID, usage)
	r.statsMgr.Save(r.pump.ID)
	//r.Telemetry().EmitMetric("doser"+r.pump.Name+"-usage", usage.Pump)
}
