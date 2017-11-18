package utils

import (
	"log"
	"net/smtp"
	"strconv"
)

type Mailer interface {
	Email(subject, body string) error
}

type MailerConfig struct {
	Server   string `json:"server"`
	Port     int    `json:"port"`
	From     string `json:"from"`
	Password string `json:"password"`
	To       string `json:"to"`
}

var GMailMailer = MailerConfig{
	Server: "smtp.gmail.com",
	Port:   587,
}

func (c *MailerConfig) Mailer() Mailer {
	auth := smtp.PlainAuth("", c.From, c.Password, c.Server)
	return &mailer{
		auth:   auth,
		config: c,
	}
}

type NoopMailer struct{}

func (n *NoopMailer) Email(s, _ string) error {
	log.Println("Noop email: subject:", s)
	return nil
}

type mailer struct {
	auth   smtp.Auth
	config *MailerConfig
}

func (m *mailer) Email(subject, body string) error {
	msg := "From: " + m.config.From + "\n"
	msg = msg + "To: " + m.config.To + "\n"
	msg = msg + "Subject: " + subject + "\n\n"
	msg = msg + body
	log.Println("Sending email to:", m.config.To, " subject:", subject)
	return smtp.SendMail(m.config.Server+":"+strconv.Itoa(m.config.Port), m.auth, m.config.From, []string{m.config.To}, []byte(msg))
}
