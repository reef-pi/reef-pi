SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reef-pi

.PHONY:bin
bin:
	go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

.PHONY:pi
pi:
	env GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

.PHONY:pi-zero
pi-zero:
	env GOARM=6 GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

test:
	go test -cover -v -race ./...

.PHONY: go-get
go-get:
	go get -u github.com/boltdb/bolt/...
	go get -u gopkg.in/yaml.v2
	go get -u github.com/stretchr/gomniauth
	go get -u github.com/stretchr/gomniauth/providers/google
	go get -u github.com/kidoman/embd
	go get -u github.com/gorilla/mux
	go get -u gopkg.in/robfig/cron.v2
	go get -u github.com/dustin/go-humanize
	go get -u github.com/ranjib/adafruitio

.PHONY: vet
vet:
	go vet ./...

.PHONY: build
build: clean go-get test bin

.PHONY: deb
deb:
	mkdir -p dist/var/lib/reef-pi/assets dist/usr/bin dist/etc/reef-pi
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp assets/bootstrap.min.css dist/var/lib/reef-pi/assets/bootstrap.min.css
	cp assets/home.html dist/var/lib/reef-pi/assets/home.html
	cp assets/login.html dist/var/lib/reef-pi/assets/login.html
	cp assets/ui.js dist/var/lib/reef-pi/assets/ui.js
	cp build/reef-pi.yml dist/etc/reef-pi/config.yml
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: clean
clean:
	-rm -rf *.deb
	-rm -rf dist
	-rm *.db
