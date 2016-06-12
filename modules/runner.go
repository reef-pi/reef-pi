package modules

import (
	"os/exec"
)

type Runner interface {
	Run(string, ...string) error
}

type CommandRunner struct {
}

func (c *CommandRunner) Run(executable string, args ...string) error {
	return exec.Command(executable, args...).Run()
}
