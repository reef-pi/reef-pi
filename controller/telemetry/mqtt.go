package telemetry

import (
	"crypto/tls"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"log"
	"os"
)

type MQTTConfig struct {
	Enable   bool   `json:"enable"`
	Server   string `json:"server"`
	Topic    string `json:"topic"`
	Username string `json:"username"`
	ClientID string `json:"client_id"`
	Password string `json:"password"`
	QoS      int    `json:"qos"`
	Retained bool   `json:"retained"`
}

var DefaultMQTTConfig = MQTTConfig{
	Server:   "tcp://127.0.0.1:1883", // "The full URL of the MQTT server to connect to
	QoS:      0,                      // The QoS to send the messages at
	Retained: false,                  // Are the messages sent with the retained flag
	Username: "",                     // A username to authenticate to the MQTT server
	Password: "",                     //Password to match username
	ClientID: "reef-pi.local",
}

type MQTTClient struct {
	config MQTTConfig
	client mqtt.Client
}

func NewMQTTClient(conf MQTTConfig) (*MQTTClient, error) {
	mqtt.ERROR = log.New(os.Stdout, "", 0)
	connOpts := mqtt.NewClientOptions().AddBroker(conf.Server).SetClientID(conf.ClientID).SetCleanSession(true)
	if conf.Username != "" {
		connOpts.SetUsername(conf.Username)
		if conf.Password != "" {
			connOpts.SetPassword(conf.Password)
		}
	}
	tlsConfig := &tls.Config{InsecureSkipVerify: true, ClientAuth: tls.NoClientCert}
	connOpts.SetTLSConfig(tlsConfig)

	client := mqtt.NewClient(connOpts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		return nil, token.Error()
	}
	return &MQTTClient{
		config: conf,
		client: client,
	}, nil
}

func (m *MQTTClient) Publish(topic, msg string) error {
	t := m.client.Publish(topic, byte(m.config.QoS), m.config.Retained, msg)
	return t.Error()
}
