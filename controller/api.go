package controller

import (
	"github.com/gorilla/mux"
	"github.com/reef-pi/reef-pi/auth"
	"log"
	"net/http"
)

func (c *Controller) LoadAPI(r *mux.Router) {
	r.HandleFunc("/api/capabilities", c.GetCapabilities).Methods("GET")
	if c.config.Equipments.Enable {
		c.state.equipments.LoadAPI(r)
	}
	if c.config.Lighting.Enable {
		c.state.lighting.LoadAPI(r)
	}
	if c.config.Temperature.Enable {
		c.state.temperature.LoadAPI(r)
	}
	if c.config.System.Enable {
		c.state.system.LoadAPI(r)
	}
	if c.config.Timer.Enable {
		c.state.timer.LoadAPI(r)
	}
}

var DefaultAPIConfig = API{
	Address: "localhost:8080",
}

type APIServer struct {
	config API
}

func SetupAPIServer(config API) (error, *mux.Router) {
	server := &APIServer{
		config: config,
	}
	if server.config.Address == "" {
		server.config.Address = DefaultAPIConfig.Address
	}
	assets := http.FileServer(http.Dir("assets"))
	docs := http.FileServer(http.Dir("doc"))
	log.Println("Image directory:", server.config.ImageDirectory)
	images := http.FileServer(http.Dir(server.config.ImageDirectory))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "assets/home.html")
	})

	router := mux.NewRouter()
	if config.EnableAuth {
		log.Println("Enabling authentication")
		if err := auth.Setup(config.Auth); err != nil {
			return err, nil
		}
		http.Handle("/assets/", auth.Check(http.StripPrefix("/assets/", assets)))
		http.Handle("/images/", auth.Check(http.StripPrefix("/images/", images)))
		http.Handle("/doc/", auth.Check(http.StripPrefix("/doc/", docs)))
		http.Handle("/api/", auth.Check(router))

	} else {
		http.Handle("/assets/", http.StripPrefix("/assets/", assets))
		http.Handle("/images/", http.StripPrefix("/images/", images))
		http.Handle("/doc/", http.StripPrefix("/doc/", docs))
		http.Handle("/api/", router)
	}
	log.Printf("Starting http server at: %s\n", server.config.Address)
	go http.ListenAndServe(server.config.Address, nil)
	return nil, router
}
