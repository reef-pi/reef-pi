package utils

import (
	"testing"
)

func TestCommand(t *testing.T) {
	if err := Command("ls").Run(); err != nil {
		t.Error(err)
	}
	if _, err := Command("doesnotexist").WithDevMode(true).CombinedOutput(); err != nil {
		t.Error(err)
	}
	if _, err := Command("ls").CombinedOutput(); err != nil {
		t.Error(err)
	}
	c := Command("ls")
	c.DevMode = true
	if err := c.Run(); err != nil {
		t.Error(err)
	}
}

func TestCommandRecordsBinaryAndArguments(t *testing.T) {
	c := Command("reef-pi", "daemon", "-config", "config.yml")

	if c.bin != "reef-pi" {
		t.Fatalf("expected command binary reef-pi, got %q", c.bin)
	}
	if len(c.args) != 3 {
		t.Fatalf("expected three args, got %#v", c.args)
	}
	if c.args[0] != "daemon" || c.args[1] != "-config" || c.args[2] != "config.yml" {
		t.Fatalf("unexpected command args: %#v", c.args)
	}
}

func TestCommandWithDevModeReturnsSameCommand(t *testing.T) {
	c := Command("doesnotexist")

	if got := c.WithDevMode(true); got != c {
		t.Fatal("expected WithDevMode to return the same command")
	}
	if !c.DevMode {
		t.Fatal("expected DevMode to be enabled")
	}
	if err := c.Run(); err != nil {
		t.Fatalf("expected dev mode Run to skip execution: %v", err)
	}
}

func TestCommandErrorsForMissingBinary(t *testing.T) {
	missingBinary := "/path/to/reef-pi-missing-command"

	if err := Command(missingBinary).Run(); err == nil {
		t.Fatal("expected Run to fail for missing binary")
	}
	if output, err := Command(missingBinary).CombinedOutput(); err == nil {
		t.Fatalf("expected CombinedOutput to fail for missing binary, output %q", string(output))
	}
}

func TestCommandRunDetachedErrorsForMissingBinary(t *testing.T) {
	if err := Command("/path/to/reef-pi-missing-command").RunDetached(); err == nil {
		t.Fatal("expected RunDetached to fail for missing binary")
	}
}
