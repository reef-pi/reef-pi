SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reefer

.PHONY:bin
bin: $(BINARY)

$(BINARY): $(SOURCES)
	go build -o $(BINARY) -ldflags "-s -w -X main.Version=0.0.$(VERSION)"  commands/*.go
	sha256sum $(BINARY)

test:
	go test -cover -v -race ./...

.PHONY: go-get
go-get:
	go get github.com/boltdb/bolt/...
	go get gopkg.in/yaml.v2
	go get github.com/stretchr/gomniauth
	go get github.com/stretchr/gomniauth/providers/google
	go get github.com/kidoman/embd
	go get github.com/gorilla/mux
	go get gopkg.in/robfig/cron.v2
	go get github.com/dustin/go-humanize
.PHONY: vet
vet:
	go tool vet -shadow ./...

.PHONY: build
build: go-get test bin


.PHONY: deb
deb:
	rm -rf dist
	mkdir -p dist/var/lib/reefer/assets dist/usr/bin dist/etc
	cp bin/reefer dist/usr/bin/reefer
	cp assets/bootstrap.min.css dist/var/lib/reefer/assets/bootstrap.min.css
	cp assets/home.html dist/var/lib/reefer/assets/home.html
	cp assets/ui.js dist/var/lib/reefer/assets/ui.js
	cp doc/config.yml dist/etc/config.yml
	bundle exec fpm -t deb -s dir -a armhf -n reefer -v 0.0.$(VERSION) -m ranjib@linux.com --deb-systemd doc/reefer.service -C dist  -p reefer-0.0.$(VERSION).deb .
