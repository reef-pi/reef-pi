package webui

import (
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
		h.templ = template.Must(template.ParseFiles(templPath))
	})
	var data = []string{}
	h.templ.Execute(w, data)
}
