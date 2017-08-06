package controller

func (c *Controller) Capabilities() (capabilities []string) {
	if c.config.EnableGPIO {
		capabilities = append(capabilities, "gpio")
	}
	if c.config.EnablePWM {
		capabilities = append(capabilities, "pwm")
	}
	if c.config.ATO.Enable {
		capabilities = append(capabilities, "ato")
	}
	if c.config.Lighting.Enable {
		capabilities = append(capabilities, "lighting")
	}
	if c.config.Temperature.Enable {
		capabilities = append(capabilities, "temperature")
	}
	if c.config.AdafruitIO.Enable {
		capabilities = append(capabilities, "telemetry")
	}
	return
}
