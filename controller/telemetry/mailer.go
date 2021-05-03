package telemetry

import (
	"log"
	"net/smtp"
	"strconv"
)

type Mailer interface {
	Email(subject, body string) error
}

type MailerConfig struct {
	Server   string   `json:"server"`
	Port     int      `json:"port"`
	From     string   `json:"from"`
	Username string   `json:"username"`
	Password string   `json:"password"`
	To       []string `json:"to"`
}

var GMailMailer = MailerConfig{
	Server: "smtp.gmail.com",
	Port:   587,
	To:     []string{},
}

type MailerCustomizer func(m *mailer)

func (c *MailerConfig) Mailer(opts ...MailerCustomizer) Mailer {
    m :=  &mailer{
        config: c,
    }

    for _, opt := range opts {
        opt(m)
    }

    if m.auth == nil {
        var username string
        if c.Username != "" {
            username = c.Username
        } else {
            username = c.From
        }
        m.auth = smtp.PlainAuth("", username, c.Password, c.Server)
    }

    if m.sendMail == nil {
        m.sendMail = smtp.SendMail
    }

    return m
}

type NoopMailer struct{}

func (n *NoopMailer) Email(s, _ string) error {
	log.Println("Noop email: subject:", s)
	return nil
}

type mailer struct {
	auth     smtp.Auth
	config   *MailerConfig
	sendMail func(string, smtp.Auth, string, []string, []byte) error
}

func (m *mailer) msg(subject, body string) string {
	msg := "From: " + m.config.From + "\n"
	for _, to := range m.config.To {
		msg = msg + "To: " + to + "\n"
		break
	}
	msg = msg + "Subject: " + subject + "\n\n"
	msg = msg + body
	return msg
}

func (m *mailer) Email(subject, body string) error {
	msg := m.msg(subject, body)
	log.Println("Sending email to:", m.config.To, " subject:", subject)
	return m.sendMail(m.config.Server+":"+strconv.Itoa(m.config.Port), m.auth, m.config.From, m.config.To, []byte(msg))
}
