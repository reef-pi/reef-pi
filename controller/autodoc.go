package controller

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"net/http"
	"os"
)

var (
	docTypes = make(map[string]map[string]*container)
)

type DocRouter struct {
	mux.Router
}

type DocRoute struct {
	mux.Route
}

type container struct {
	Req  interface{}
	Resp interface{}
}

func NewDocRouter() *DocRouter {
	return &DocRouter{*mux.NewRouter()}
}

func (r *DocRoute) Doc(in, out interface{}) {
	path, _ := r.GetPathTemplate()
	docs := make(map[string]*container)
	if ds, ok := docTypes[path]; ok {
		docs = ds
	}
	for m, ct := range docs {
		if ct == nil {
			docs[m] = &container{Req: in, Resp: out}
			return
		}
	}
}

func (r *DocRouter) HandleFunc(path string, f func(http.ResponseWriter, *http.Request)) *DocRoute {
	docTypes[path] = make(map[string]*container)
	return &DocRoute{*r.Router.HandleFunc(path, f)}
}

func (r *DocRoute) Methods(mts ...string) *DocRoute {
	path, _ := r.GetPathTemplate()
	for _, m := range mts {
		docTypes[path][m] = nil
	}
	r.Route.Methods(mts...)
	return r
}
func (r *DocRouter) Summarize() {
	fi, err := os.Create("api.txt")
	if err != nil {
		log.Println("ERROR: Failed to open api.md file. Error:", err)
		return
	}
	defer fi.Close()

	for path, verbs := range docTypes {
		for verb, ct := range verbs {
			fi.WriteString(fmt.Sprintf("%6s\t%s\n", verb, path))
			if ct == nil {
				continue
			}
			fmt.Println("data:", path, verb)
			if ct.Req != nil {
				fi.WriteString("Input:\n")
				enc := json.NewEncoder(fi)
				enc.SetIndent("", " ")
				enc.Encode(ct.Req)
			}
			if ct.Resp != nil {
				fi.WriteString("Output:\n")
				enc := json.NewEncoder(fi)
				enc.SetIndent("", " ")
				enc.Encode(ct.Resp)
			}
		}
	}
}
