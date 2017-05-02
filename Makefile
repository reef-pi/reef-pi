SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reef-pi

.PHONY:bin
bin: $(BINARY)

$(BINARY): $(SOURCES)
	go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

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
	go vet ./...

.PHONY: build
build: go-get test bin


.PHONY: deb
deb: clean
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp assets/bootstrap.min.css dist/var/lib/reef-pi/assets/bootstrap.min.css
	cp assets/home.html dist/var/lib/reef-pi/assets/home.html
	cp assets/login.html dist/var/lib/reef-pi/assets/login.html
	cp assets/ui.js dist/var/lib/reef-pi/assets/ui.js
	cp doc/config.yml dist/etc/reef-pi/config.yml
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd doc/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: clean
clean:
	-rm -rf *.deb
	-rm -rf dist
