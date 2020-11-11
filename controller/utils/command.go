package utils

import (
	"os"
	"os/exec"
)

type ExecCommand struct {
	bin     string
	args    []string
	DevMode bool
}

func (e *ExecCommand) Run() error {
	if e.DevMode {
		return nil
	}
	return exec.Command(e.bin, e.args...).Run()
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

func (e *ExecCommand) RunDetached() error {
	attr := os.ProcAttr{
		Dir:   "/var/lib/reef-pi",
		Env:   os.Environ(),
		Files: []*os.File{os.Stdin, os.Stdout, os.Stderr},
	}
	p, err := os.StartProcess(e.bin, e.args, &attr)
	if err != nil {
		return err
	}
	return p.Release()
}
