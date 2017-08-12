package controller

func (c *Controller) Capabilities() (capabilities []string) {
	if c.config.Equipments.Enable {
		capabilities = append(capabilities, "equipments")
	}
	if c.config.Timer.Enable {
		capabilities = append(capabilities, "timer")
	}
	if c.config.Lighting.Enable {
		capabilities = append(capabilities, "lighting")
	}
	if c.config.Temperature.Enable {
		capabilities = append(capabilities, "temperature")
	}
	if c.config.ATO.Enable {
		capabilities = append(capabilities, "ato")
	}
	if c.config.System.Enable {
		capabilities = append(capabilities, "system")
	}
	return
}
