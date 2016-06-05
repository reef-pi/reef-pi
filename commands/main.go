package main

import (
	"flag"
	"fmt"
	log "github.com/Sirupsen/logrus"
	"github.com/stretchr/gomniauth"
	"github.com/stretchr/gomniauth/providers/google"
	"github.com/stretchr/objx"
	"gopkg.in/yaml.v2"
	"io/ioutil"
	"net/http"
	"path/filepath"
	"strings"
	"sync"
	"text/template"
)

func main() {
	configFile := flag.String("config", "reefer.yml", "Reefer config file path")
	port := flag.Int("port", 8080, "Network port to bind to")
	logLevel := flag.String("log", "info", "Logging level")
	flag.Parse()
	setupLogger(*logLevel)
	conf, err := ParseConfig(*configFile)
	if err != nil {
		log.Warnln("Failed to pasrse oauth config")
		log.Fatal(err)
	}
	authProvider := google.New(conf.ID, conf.Secret, conf.CallbackUrl)
	gomniauth.SetSecurityKey(conf.GomniauthSecret)
	gomniauth.WithProviders(authProvider)

	assets := http.FileServer(http.Dir("assets"))
	http.Handle("/login", &templateHandler{filename: "login.html"})
	http.Handle("/assets", http.StripPrefix("/assets/", assets))
	http.HandleFunc("/auth/", loginHandler)
	http.HandleFunc("/logout", logoutHandler)
	http.Handle("/", MustAuth(&homePageHandler{conf: conf}))
	addr := fmt.Sprintf(":%d", *port)
	log.Infof("Starting http server at: %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

func setupLogger(level string) {
	switch level {
	case "panic":
		log.SetLevel(log.PanicLevel)
	case "fatal":
		log.SetLevel(log.FatalLevel)
	case "error":
		log.SetLevel(log.ErrorLevel)
	case "warn":
		log.SetLevel(log.WarnLevel)
	case "info":
		log.SetLevel(log.InfoLevel)
	case "debug":
		log.SetLevel(log.DebugLevel)
	default:
		log.Fatalf("Unknown log level: %s", level)
	}
}

type Config struct {
	ID              string   `yaml:"id"`
	Secret          string   `yaml:"secret"`
	CallbackUrl     string   `yaml:"callback_url"`
	GomniauthSecret string   `yaml:"gomniauth_secret"`
	Users           []string `yaml:"users"`
	Domain          string   `yaml:"domain"`
}

func ParseConfig(filename string) (*Config, error) {
	var c Config
	content, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatal("Failed to read config file. ", err)
		return nil, err
	}
	if err := yaml.Unmarshal(content, &c); err != nil {
		log.Fatal("Failed to unmarshal yaml file ", err)
		return nil, err
	}
	return &c, nil
}

type authHandler struct {
	next http.Handler
}

func (h *authHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if _, err := r.Cookie("auth"); err == http.ErrNoCookie {
		w.Header().Set("Location", "/login")
		log.Println("Not authenticated")
		w.WriteHeader(http.StatusTemporaryRedirect)
	} else if err != nil {
		panic(err.Error())
	} else {
		h.next.ServeHTTP(w, r)
	}
}

// MustAuth Enforce google oauth
func MustAuth(handler http.Handler) http.Handler {
	return &authHandler{next: handler}
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	log.Debug("Logout handler invoked")
	http.SetCookie(w, &http.Cookie{
		Name:   "auth",
		MaxAge: -1,
	})
	w.Header().Set("Location", "/login")
	w.WriteHeader(http.StatusTemporaryRedirect)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	segs := strings.Split(r.URL.Path, "/")
	action := segs[2]
	log.Println("OAuth provider:", segs[3])
	switch action {
	case "login":
		provider, err := gomniauth.Provider(segs[3])
		if err != nil {
			log.Fatalln("Error when trying to get provider", provider, " Error: ", err)
		}

		loginURL, err := provider.GetBeginAuthURL(nil, nil)
		if err != nil {
			log.Fatalln("Error when trying to get BeginAuthURL", provider, " Error: ", err)
		}
		w.Header().Set("Location", loginURL)
		w.WriteHeader(http.StatusTemporaryRedirect)
	case "callback":
		provider, err := gomniauth.Provider(segs[3])
		if err != nil {
			log.Fatalln("Error when trying to get provider", provider, " Error: ", err)
		}
		creds, err := provider.CompleteAuth(objx.MustFromURLQuery(r.URL.RawQuery))
		if err != nil {
			log.Fatalln("Error while trying to complete auth for ", provider, " Error: ", err)
		}
		user, err := provider.GetUser(creds)
		if err != nil {
			log.Fatalln("Error while trying to get user from ", provider, " Error: ", err)
		}
		parts := strings.Split(user.Email(), "@")
		// externalize config
		if parts[len(parts)-1] != "gmail.com" {
			log.Fatalln("Not a valid user. Email domain:", parts[len(parts)-1])
		}
		authCookieValue := objx.New(map[string]interface{}{
			"name": user.Name(),
		}).MustBase64()
		http.SetCookie(w, &http.Cookie{
			Name:  "auth",
			Value: authCookieValue,
			Path:  "/"})
		w.Header()["Location"] = []string{"/"}
		w.WriteHeader(http.StatusTemporaryRedirect)
	default:
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Auth action %s not supported", action)
	}
}

type templateHandler struct {
	once     sync.Once
	filename string
	templ    *template.Template
}

func (t *templateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	t.once.Do(func() {
		templPath := filepath.Join("templates", t.filename)
		log.Info("Compiling template: ", templPath)
		t.templ = template.Must(template.ParseFiles(templPath))
	})
	t.templ.Execute(w, r)
}

type homePageHandler struct {
	once  sync.Once
	templ *template.Template
	conf  *Config
}

func (h *homePageHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.once.Do(func() {
		templPath := filepath.Join("templates", "home.html")
		log.Info("Compiling template: ", templPath)
		h.templ = template.Must(template.ParseFiles(templPath))
	})
	var data = []string{}
	h.templ.Execute(w, data)
}
