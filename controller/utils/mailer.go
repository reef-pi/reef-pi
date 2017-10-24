package utils

import (
	"log"
	"net/smtp"
)

const SMTPDomain = "smtp.gmail.com"
const SMTPAddress = SMTPDomain + ":587"

type Mailer interface {
	Email(to, subject, body string) error
}

type gmail struct {
	auth smtp.Auth
	from string
}

func NewMailer(user, password string) Mailer {
	auth := smtp.PlainAuth("", user, password, SMTPDomain)
	return &gmail{
		auth: auth,
		from: user,
	}
}

func (m *gmail) Email(to, subject, body string) error {
	msg := "From: " + m.from + "\n"
	msg = msg + "To: " + to + "\n"
	msg = msg + "Subject: " + subject + "\n\n"
	msg = msg + body
	log.Println("Sending email to:", to, " subject:", subject)
	return smtp.SendMail(SMTPAddress, m.auth, m.from, []string{to}, []byte(msg))
}
