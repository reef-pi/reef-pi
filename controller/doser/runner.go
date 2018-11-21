package doser

import (
	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/types"
	"github.com/reef-pi/reef-pi/controller/utils"
	"log"
	"time"
)

type Runner struct {
	pump     *Pump
	jacks    *connectors.Jacks
	statsMgr types.StatsManager
}

func (r *Runner) Run() {
	v := make(map[int]float64)
	v[r.pump.Pin] = r.pump.Regiment.Speed

	log.Println("doser sub system: setting pwm pin:", r.pump.Pin, "at speed", r.pump.Regiment.Speed)
	usage := Usage{
		Time: utils.TeleTime(time.Now()),
	}
	r.statsMgr.Update(r.pump.ID, usage)
	if err := r.jacks.Control(r.pump.Jack, v); err != nil {
		log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		return
	}
	select {
	case <-time.After(r.pump.Regiment.Duration * time.Second):
		v[r.pump.Pin] = 0
		log.Println("doser sub system: setting pwm pin:", r.pump.Pin, "at speed", 0)
		if err := r.jacks.Control(r.pump.Jack, v); err != nil {
			log.Println("ERROR: dosing sub-system. Failed to control jack. Error:", err)
		}
	}
	usage.Pump = int(r.pump.Regiment.Duration)
	r.statsMgr.Update(r.pump.ID, usage)
	//r.Telemetry().EmitMetric("doser"+r.pump.Name+"-usage", usage.Pump)
}
