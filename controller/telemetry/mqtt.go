package telemetry

import (
	"crypto/tls"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"log"
	"os"
)

type MQTTConfig struct {
	server   string
	topic    string
	username string
	clientid string
	password string
	qos      int
	retained bool
}

var DefaultMQTTConfig = MQTTConfig{
	server:   "tcp://127.0.0.1:1883", // "The full URL of the MQTT server to connect to
	topic:    "reef-pi",              // Topic to publish the messages on
	qos:      0,                      // The QoS to send the messages at
	retained: false,                  // Are the messages sent with the retained flag
	username: "",                     // A username to authenticate to the MQTT server
	password: "",                     //Password to match username
	clientid: "reef-pi.local",
}

type MQTTClient struct {
	config MQTTConfig
	client mqtt.Client
}

func NewMQTTClient(conf MQTTConfig) (*MQTTClient, error) {
	mqtt.ERROR = log.New(os.Stdout, "", 0)
	connOpts := mqtt.NewClientOptions().AddBroker(conf.server).SetClientID(conf.clientid).SetCleanSession(true)
	if conf.username != "" {
		connOpts.SetUsername(conf.username)
		if conf.password != "" {
			connOpts.SetPassword(conf.password)
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
	t := m.client.Publish(topic, byte(m.config.qos), m.config.retained, msg)
	return t.Error()
}
