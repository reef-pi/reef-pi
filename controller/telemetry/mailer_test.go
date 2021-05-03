package telemetry

import (
    "net/smtp"
    "strings"
    "testing"
)

func TestMailer(t *testing.T) {

    var TestMailerConfig = MailerConfig{
        Server: "smtp.gmail.com",
        Port: 587,
        From: "from@gmail.com",
        To: []string{"to@gmail.com"},
        Password: "gmail_password",
    }

    m := TestMailerConfig.Mailer(func(m *mailer) {
        m.sendMail = func(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
            if addr != "smtp.gmail.com:587" {
                t.Error("Expected smtp.gmail.com:587, found", addr)
            }

            if auth == nil {
                t.Error("Expected auth")
            }

            var serverInfo = smtp.ServerInfo{
                TLS:  true,
                Name: "smtp.gmail.com",
            }

            var _, resp, err = auth.Start(&serverInfo)
            if err != nil {
                t.Error(err)
            }

            if !strings.Contains(string(resp), "from@gmail.com") {
                t.Error("Expected from@gmail.com, found", string(resp))
            }

            if !strings.Contains(string(resp), "gmail_password") {
                t.Error("Expected gmail_password, found", string(resp))
            }

            if from != "from@gmail.com" {
                t.Error("Expected from@gmail.com, found", from)
            }

            if to[0] != "to@gmail.com" {
                t.Error("Expected to@gmail.com, found", to[0])
            }

            body := string(msg)
            if !strings.Contains(body, "From: from@gmail.com") {
                t.Error("subject mismatch", body)
            }

            if !strings.Contains(body, "To: to@gmail.com") {
                t.Error("To mismatch", body)
            }

            if !strings.Contains(body, "Subject: Hi") {
                t.Error("subject mismatch", body)
            }

            if !strings.Contains(body, "Bye") {
                t.Error("Body mismatch", body)
            }
            return nil
        }
    })

    if err := m.Email("Hi", "Bye"); err != nil {
        t.Error(err)
    }

    TestMailerConfig = MailerConfig{
        Server: "smtp.sa-east-1.amazonses.com",
        Port: 587,
        From: "from@amazon.com",
        To: []string{"to@amazon.com"},
        Username: "iam_username",
        Password: "iam_password",
    }

    m = TestMailerConfig.Mailer(func(m *mailer) {
        m.sendMail = func(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
            if addr != "smtp.sa-east-1.amazonses.com:587" {
                t.Error("Expected smtp.sa-east-1.amazonses.com:587, found", addr)
            }

            if auth == nil {
                t.Error("Expected auth")
            }

            var serverInfo = smtp.ServerInfo{
                TLS:  true,
                Name: "smtp.sa-east-1.amazonses.com",
            }

            var _, resp, err = auth.Start(&serverInfo)
            if err != nil {
                t.Error(err)
            }

            if !strings.Contains(string(resp), "iam_username") {
                t.Error("Expected iam_username, found", string(resp))
            }

            if !strings.Contains(string(resp), "iam_password") {
                t.Error("Expected iam_password, found", string(resp))
            }

            if from != "from@amazon.com" {
                t.Error("Expected from@amazon.com, found", from)
            }

            return nil
        }
    })

    if err := m.Email("Hi", "Bye"); err != nil {
        t.Error(err)
    }

}
