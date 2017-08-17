package utils

import (
	"os/exec"
)

type ExecCommand struct {
	bin     string
	args    []string
	DevMode bool
}

func (e *ExecCommand) CombinedOutput() ([]byte, error) {
	if e.DevMode {
		return []byte(""), nil
	}
	return exec.Command(e.bin, e.args...).CombinedOutput()
}

func (e *ExecCommand) WithDevMode(b bool) *ExecCommand {
	e.DevMode = b
	return e
}

func Command(bin string, args ...string) *ExecCommand {
	return &ExecCommand{
		bin:  bin,
		args: args,
	}
}
