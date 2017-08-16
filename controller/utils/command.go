package utils

import (
	"os/exec"
)

type ExecCommand struct {
	bin  string
	args []string
}

func (e *ExecCommand) CombinedOutput() ([]byte, error) {
	return exec.Command(e.bin, e.args...).CombinedOutput()
}

func Command(bin string, args ...string) *ExecCommand {
	return &ExecCommand{
		bin:  bin,
		args: args,
	}
}
