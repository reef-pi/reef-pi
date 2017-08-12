package utils

type ExecCommand struct {
	bin  string
	args []string
}

func (e *ExecCommand) CombinedOutput() (string, error) {
	return "", nil
}

func Command(bin string, args ...string) *ExecCommand {
	return &ExecCommand{
		bin:  bin,
		args: args,
	}
}
