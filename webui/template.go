package webui

import (
	log "github.com/Sirupsen/logrus"
	"html/template"
	"net/http"
	"path/filepath"
	"sync"
)

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
