package webui

import (
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
		t.templ = template.Must(template.ParseFiles(templPath))
	})
	t.templ.Execute(w, r)
}
