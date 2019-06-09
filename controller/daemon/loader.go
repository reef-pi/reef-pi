package daemon

import (
	"fmt"
	"log"
	"time"

	"github.com/reef-pi/rpi/i2c"

	"github.com/reef-pi/reef-pi/controller/connectors"
	"github.com/reef-pi/reef-pi/controller/modules/ato"
	"github.com/reef-pi/reef-pi/controller/modules/camera"
	"github.com/reef-pi/reef-pi/controller/modules/doser"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
	"github.com/reef-pi/reef-pi/controller/modules/lighting"
	"github.com/reef-pi/reef-pi/controller/modules/macro"
	"github.com/reef-pi/reef-pi/controller/modules/ph"
	"github.com/reef-pi/reef-pi/controller/modules/system"
	"github.com/reef-pi/reef-pi/controller/modules/temperature"
	"github.com/reef-pi/reef-pi/controller/modules/timer"
)

func (r *ReefPi) loadPhSubsystem() error {
	if !r.settings.Capabilities.Ph {
		return nil
	}
	p := ph.New(r.settings.Capabilities.DevMode, r.Controller(), r.ais)
	r.subsystems[ph.Bucket] = p
	return nil
}

func (r *ReefPi) loadMacroSubsystem() error {
	if !r.settings.Capabilities.Macro {
		return nil
	}
	m, err := macro.New(r.settings.Capabilities.DevMode, r.Controller())
	if err != nil {
		return err
	}
	r.subsystems[macro.Bucket] = m
	return nil
}

func (r *ReefPi) loadTimerSubsystem(eqs *equipment.Controller) error {
	if !r.settings.Capabilities.Timers {
		return nil
	}
	if eqs == nil {
		r.settings.Capabilities.Timers = false
		return fmt.Errorf("equipment sub-system is not initialized")
	}
	t := timer.New(r.Controller(), eqs)
	r.subsystems[timer.Bucket] = t
	eqs.AddCheck(t.IsEquipmentInUse)
	return nil
}

func (r *ReefPi) loadTemperatureSubsystem(eqs *equipment.Controller) error {
	if !r.settings.Capabilities.Temperature {
		return nil
	}
	if eqs == nil {
		r.settings.Capabilities.Temperature = false
		return fmt.Errorf("equipment sub-system is not initialized")
	}
	temp, err := temperature.New(r.settings.Capabilities.DevMode, r.Controller(), eqs)
	if err != nil {
		r.settings.Capabilities.Temperature = false
		log.Println("ERROR: Failed to initialize temperature subsystem")
		return err
	}
	r.subsystems[temperature.Bucket] = temp
	eqs.AddCheck(temp.IsEquipmentInUse)
	return nil
}

func (r *ReefPi) loadATOSubsystem(eqs *equipment.Controller) error {
	if !r.settings.Capabilities.ATO {
		return nil
	}
	if eqs == nil {
		r.settings.Capabilities.ATO = false
		return fmt.Errorf("equipment sub-system is not initialized")
	}
	a, err := ato.New(r.settings.Capabilities.DevMode, r.Controller(), eqs, r.inlets)
	if err != nil {
		r.settings.Capabilities.ATO = false
		log.Println("ERROR: Failed to initialize ato subsystem")
		return err
	}
	r.subsystems[ato.Bucket] = a
	eqs.AddCheck(a.IsEquipmentInUse)
	return nil
}

func (r *ReefPi) loadLightingSubsystem(bus i2c.Bus) error {
	if !r.settings.Capabilities.Lighting {
		return nil
	}
	conf := lighting.Config{
		DevMode:  r.settings.Capabilities.DevMode,
		Interval: 30 * time.Second,
	}
	l, err := lighting.New(conf, r.Controller(), r.jacks, r.pManager, bus)
	if err != nil {
		r.settings.Capabilities.Lighting = false
		log.Println("ERROR: Failed to initialize lighting subsystem")
		return err
	}
	r.subsystems[lighting.Bucket] = l
	return nil
}

func (r *ReefPi) loadCameraSubsystem() error {
	if !r.settings.Capabilities.Camera {
		return nil
	}
	cam, err := camera.New(r.settings.Capabilities.DevMode, r.Controller())
	if err != nil {
		r.settings.Capabilities.Camera = false
		return nil
	}
	r.subsystems[camera.Bucket] = cam
	return nil
}

func (r *ReefPi) loadDoserSubsystem(jacks *connectors.Jacks) error {
	if !r.settings.Capabilities.Doser {
		return nil
	}
	d, err := doser.New(r.settings.Capabilities.DevMode, r.Controller(), jacks)
	if err != nil {
		r.settings.Capabilities.Doser = false
		log.Println("ERROR: Failed to initialize doser subsystem")
		return err
	}
	r.subsystems[doser.Bucket] = d
	return nil
}

func (r *ReefPi) loadSubsystems() error {
	if r.settings.Capabilities.Configuration {
		conf := system.Config{
			Interface:   r.settings.Interface,
			Name:        r.settings.Name,
			Display:     r.settings.Display,
			DevMode:     r.settings.Capabilities.DevMode,
			Pprof:       r.settings.Pprof,
			RPI_PWMFreq: r.settings.RPI_PWMFreq,
			Version:     r.version,
		}
		r.subsystems[system.Bucket] = system.New(conf, r.Controller())
	}
	var eqs *equipment.Controller
	if r.settings.Capabilities.Equipment {
		conf := equipment.Config{
			DevMode: r.settings.Capabilities.DevMode,
		}
		eqs = equipment.New(conf, r.outlets, r.store, r.telemetry)
		r.subsystems[equipment.Bucket] = eqs
	}
	if err := r.loadTimerSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load timer subsystem. Error:", err)
		r.LogError("subsystem-timer", "Failed to load timer subsystem. Error:"+err.Error())
	}
	if err := r.loadATOSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load ATO subsystem. Error:", err)
		r.LogError("sub-system-ato", "Failed to load ATO subsystem. Error:"+err.Error())
	}
	if err := r.loadTemperatureSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load temperature subsystem. Error:", err)
		r.LogError("subsystem-temperature", "Failed to load temperature subsystem. Error:"+err.Error())
	}
	if err := r.loadLightingSubsystem(r.bus); err != nil {
		log.Println("ERROR: Failed to load lighting subsystem. Error:", err)
		r.LogError("subsystem-lighting", "Failed to load lighting subsystem. Error:"+err.Error())
	}
	if err := r.loadDoserSubsystem(r.jacks); err != nil {
		log.Println("ERROR: Failed to load doser subsystem. Error:", err)
		r.LogError("subsystem-doser", "Failed to load doser subsystem. Error:"+err.Error())
	}
	if err := r.loadCameraSubsystem(); err != nil {
		log.Println("ERROR: Failed to load camera subsystem. Error:", err)
		r.LogError("subsystem-camera", "Failed to load camera subsystem. Error:"+err.Error())
	}
	if err := r.loadPhSubsystem(); err != nil {
		log.Println("ERROR: Failed to load ph subsystem. Error:", err)
		r.LogError("subsystem-ph", "Failed to load ph subsystem. Error:"+err.Error())
	}
	if err := r.loadMacroSubsystem(); err != nil {
		log.Println("ERROR: Failed to load macro subsystem. Error:", err)
	}
	for sName, sController := range r.subsystems {
		if err := sController.Setup(); err != nil {
			log.Println("ERROR: Failed to setup subsystem:", sName)
			r.LogError("subsystem-"+sName+"-setup", "Failed to setup subsystem: "+sName+". Error: "+err.Error())
			return err
		}
		sController.Start()
		log.Println("Successfully started subsystem:", sName)
	}
	return nil
}
