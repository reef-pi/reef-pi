package controller

func (c *Controller) Capabilities() (capabilities []string) {
	if c.config.Dashboard.Enable {
		capabilities = append(capabilities, "dashboard")
	}
	if c.config.Equipments.Enable {
		capabilities = append(capabilities, "equipments")
	}
	if c.config.Timers.Enable {
		capabilities = append(capabilities, "timers")
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
	if c.config.Admin.Enable {
		capabilities = append(capabilities, "admin")
	}
	return
}
