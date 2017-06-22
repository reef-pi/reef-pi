package api

import (
	"github.com/ranjib/reef-pi/auth"
	"github.com/ranjib/reef-pi/controller"
	"log"
	"net/http"
)

type ServerConfig struct {
	EnableAuth     bool        `yaml:"enable_auth"`
	Address        string      `yaml:"address"`
	Auth           auth.Config `yaml:"auth"`
	ImageDirectory string      `yaml:"image_directory"`
	Interface      string      `yaml:"interface"`
	Display        bool        `yaml:"display"`
}

var DefaultConfig = ServerConfig{
	Address: "localhost:8080",
}

type Server struct {
	config ServerConfig
}

func SetupServer(config ServerConfig, c *controller.Controller) error {
	server := &Server{
		config: config,
	}
	assets := http.FileServer(http.Dir("assets"))
	docs := http.FileServer(http.Dir("doc"))
	log.Println("Image directory:", server.config.ImageDirectory)
	images := http.FileServer(http.Dir(server.config.ImageDirectory))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})

	if config.EnableAuth {
		log.Println("Enabling authentication")
		if err := auth.Setup(config.Auth); err != nil {
			return err
		}
		http.Handle("/assets/", auth.Check(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", auth.Check(http.StripPrefix("/images/", images)))
		http.Handle("/doc/", auth.Check(http.StripPrefix("/doc/", docs)))
		http.Handle("/api/", auth.Check(NewApiHandler(c, config.Interface, config.Display)))

	} else {
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/doc/", http.StripPrefix("/doc/", docs))
		http.Handle("/api/", NewApiHandler(c, config.Interface, config.Display))
	}
	log.Printf("Starting http server at: %s\n", config.Address)
	go http.ListenAndServe(config.Address, nil)
	return nil
}
