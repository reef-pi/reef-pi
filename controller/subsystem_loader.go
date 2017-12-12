package controller

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/ato"
	"github.com/reef-pi/reef-pi/controller/camera"
	"github.com/reef-pi/reef-pi/controller/doser"
	"github.com/reef-pi/reef-pi/controller/equipment"
	"github.com/reef-pi/reef-pi/controller/lighting"
	"github.com/reef-pi/reef-pi/controller/system"
	"github.com/reef-pi/reef-pi/controller/temperature"
	"github.com/reef-pi/reef-pi/controller/timer"
	"log"
	"time"
)

func (r *ReefPi) loadTimerSubsystem(eqs *equipment.Controller) error {
	if !r.settings.Capabilities.Timers {
		return nil
	}
	if eqs == nil {
		r.settings.Capabilities.Timers = false
		return fmt.Errorf("equipment sub-system is not initialized")
	}
	t := timer.New(r.store, r.telemetry, eqs)
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
	temp, err := temperature.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
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
	a, err := ato.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
	if err != nil {
		r.settings.Capabilities.ATO = false
		log.Println("ERROR: Failed to initialize ato subsystem")
		return err
	}
	r.subsystems[ato.Bucket] = a
	eqs.AddCheck(a.IsEquipmentInUse)
	return nil
}

func (r *ReefPi) loadLightingSubsystem() error {
	if !r.settings.Capabilities.Lighting {
		return nil
	}
	conf := lighting.Config{
		DevMode:  r.settings.Capabilities.DevMode,
		Interval: 30 * time.Second,
	}
	l, err := lighting.New(conf, r.jacks, r.store, r.telemetry)
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
	cam, err := camera.New(r.store)
	if err != nil {
		r.settings.Capabilities.Camera = false
		return nil
	}
	r.subsystems[camera.Bucket] = cam
	return nil
}

func (r *ReefPi) loadDoserSubsystem(eqs *equipment.Controller) error {
	if !r.settings.Capabilities.Doser {
		return nil
	}
	if eqs == nil {
		r.settings.Capabilities.Doser = false
		return fmt.Errorf("equipment sub-system is not initialized")
	}
	d, err := doser.New(r.settings.Capabilities.DevMode, r.store, r.telemetry, eqs)
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
			Interface: r.settings.Interface,
			Name:      r.settings.Name,
			Display:   r.settings.Display,
			DevMode:   r.settings.Capabilities.DevMode,
			Version:   r.version,
		}
		r.subsystems[system.Bucket] = system.New(conf, r.store, r.telemetry)
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
		log.Println("ERROR: Failed to load timer sub-system. Error:", err)
	}
	if err := r.loadATOSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load ATO sub-system. Error:", err)
	}
	if err := r.loadTemperatureSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load temperature sub-system. Error:", err)
	}
	if err := r.loadLightingSubsystem(); err != nil {
		log.Println("ERROR: Failed to load lighting sub-system. Error:", err)
	}
	if err := r.loadDoserSubsystem(eqs); err != nil {
		log.Println("ERROR: Failed to load doser sub-system. Error:", err)
	}
	if err := r.loadCameraSubsystem(); err != nil {
		log.Println("ERROR: Failed to load camera sub-system. Error:", err)
	}

	for sName, sController := range r.subsystems {
		if err := sController.Setup(); err != nil {
			log.Println("ERROR: Failed to setup subsystem:", sName)
			return err
		}
		sController.Start()
		log.Println("Successfully started subsystem:", sName)
	}
	return nil
}
