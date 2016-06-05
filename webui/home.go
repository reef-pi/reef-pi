package webui

import (
	log "github.com/Sirupsen/logrus"
	"html/template"
	"net/http"
	"path/filepath"
	"sync"
)

type homePageHandler struct {
	once  sync.Once
	templ *template.Template
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
