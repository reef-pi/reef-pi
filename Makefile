SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reefer-$(VERSION)

.PHONY:bin
bin: $(BINARY)

$(BINARY): $(SOURCES)
	env GOARCH=arm go build -o $(BINARY) -ldflags "-X main.Version=$(VERSION)"  commands/*.go
	sha256sum $(BINARY)

test:
	go test -cover -v -race ./...

.PHONY: go-get
go-get:
	go get github.com/Sirupsen/logrus
	go get gopkg.in/yaml.v2
	go get github.com/stretchr/gomniauth
	go get github.com/stretchr/gomniauth/providers/google
	go get github.com/hybridgroup/gobot
	go get github.com/kidoman/embd

.PHONY: vet
vet:
	go tool vet -shadow ./...

.PHONY: build
build: go-get test bin
