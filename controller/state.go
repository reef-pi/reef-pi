package controller

import (
	"github.com/kidoman/embd"
	"github.com/ranjib/reef-pi/controller/lighting"
	"github.com/ranjib/reef-pi/controller/temperature"
	"github.com/ranjib/reef-pi/controller/utils"
	"log"
)

type State struct {
	pwm         *utils.PWM // Pulse Width Modulation (LED bringhtiness, DC pump speed)
	lighting    *lighting.Lighting
	tController *temperature.Controller
	telemetry   *utils.Telemetry
	config      Config
	store       *Store
}

func NewState(c Config, store *Store, telemetry *utils.Telemetry) *State {
	return &State{
		config:    c,
		store:     store,
		telemetry: telemetry,
	}
}

func (s *State) Bootup() error {
	if s.config.EnableGPIO {
		log.Println("Enabled GPIO subsystem")
		embd.InitGPIO()
	}
	if s.config.EnableTemperatureSensor {
		var tConfig temperature.Config
		tController, err := temperature.NewController(tConfig, s.telemetry)
		if err != nil {
			log.Println("Failed to initialize temperature controller")
			return err
		}
		s.tController = tController
		go s.tController.Start()
		log.Println("Enabled temperature senosor subsystem")
	}
	if s.config.EnablePWM {
		p, err := utils.NewPWM(s.config.DevMode)
		if err != nil {
			log.Println("ERROR: Failed to initialize pwm system")
			return err
		}
		s.pwm = p
		s.pwm.Start()
		log.Println("Enabled PWM subsystem")
	}
	if s.config.EnablePWM && s.config.Lighting.Enabled {
		lConfig := lighting.DefaultConfig(s.config.Lighting.Channels)
		if err := s.store.Get(LightingBucket, "config", &lConfig); err != nil {
			log.Println("No existing lighting settings found. Resetting")
			if lErr := s.store.Update(LightingBucket, "config", lConfig); lErr != nil {
				log.Println("Failied to initalize lighting subsystem")
				return err
			}
		}
		s.lighting = lighting.New(s.config.Lighting.Channels, s.telemetry)
		s.lighting.Reconfigure(s.pwm, lConfig)
		log.Println("Successfully initialized lighting subsystem")
	}
	return nil
}

func (s *State) TearDown() {
	if s.config.Lighting.Enabled {
		s.lighting.StopCycle()
	}
	if s.config.DevMode {
		log.Println("Running is dev mode, skipping driver teardown")
		return
	}
	if s.config.EnablePWM {
		s.pwm.Stop()
		log.Println("Stopped PWM subsystem")
	}
	if s.config.EnableTemperatureSensor {
		s.tController.Stop()
		log.Println("Stopped temperature sensor subsystem")
	}
	if s.config.EnableGPIO {
		embd.CloseGPIO()
		log.Println("Stopping GPIO subsystem")
	}
}
