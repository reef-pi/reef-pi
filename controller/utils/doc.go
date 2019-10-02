package utils

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"log"
	"os"
)

type container struct {
	Req  interface{}
	Resp interface{}
}

var (
	docTypes = make(map[string]map[string]*container)
)

func APIDoc(r *mux.Route, in, out interface{}) {
	path, err := r.GetPathTemplate()
	if err != nil {
		log.Println("API Doc error:", err)
		return
	}
	mts, err := r.GetMethods()
	if err != nil {
		log.Println("API Doc error:", err)
		return
	}
	fmt.Println("Methods:", mts)
	docs := make(map[string]*container)
	if ds, ok := docTypes[path]; ok {
		docs = ds
	}
	for _, m := range mts {
		_, ok := docs[m]
		if ok {
			continue
		}
		docs[m] = &container{Req: in, Resp: out}
		break
	}
	docTypes[path] = docs
	log.Println("API Doc path:", path)
}

func SummarizeAPI() {
	fi, err := os.Create("api.txt")
	if err != nil {
		log.Println("ERROR: Failed to open api.txt file. Error:", err)
		return
	}
	defer fi.Close()

	for path, verbs := range docTypes {
		fmt.Println("Path", path, "Methods:", verbs)
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
