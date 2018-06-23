package utils

import (
	"strings"
	"testing"
)

func TestMailer(t *testing.T) {
	GMailMailer.Mailer()
	m := &mailer{
		config: &GMailMailer,
	}
	msg := m.msg("Hi", "")
	if !strings.Contains(msg, "Subject: Hi") {
		t.Error("subject mismatch", msg)
	}
}

func TestTwoDecimal(t *testing.T) {
	if TwoDecimal(1.2345) != 1.23 {
		t.Error("Expected 1.23, found", TwoDecimal(1.2345))
	}
}
