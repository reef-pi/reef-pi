SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reefer

.PHONY:bin
bin: $(BINARY)

$(BINARY): $(SOURCES)
	go build -o $(BINARY) -ldflags "-X main.Version=$(VERSION)"  commands/*.go
	sha256sum $(BINARY)

test:
	go test -cover -v -race ./...

.PHONY: go-get
go-get:
	go get github.com/boltdb/bolt/...
	go get gopkg.in/yaml.v2
	go get github.com/stretchr/gomniauth
	go get github.com/stretchr/gomniauth/providers/google
	go get gobot.io/x/gobot
	go get github.com/kidoman/embd
	go get github.com/gorilla/mux
	go get gopkg.in/robfig/cron.v2
.PHONY: vet
vet:
	go tool vet -shadow ./...

.PHONY: build
build: go-get test bin
