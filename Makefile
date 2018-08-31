SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION=$(shell git describe --always --tags)
BINARY=bin/reef-pi

.PHONY:bin
bin:
	go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go
	npm run build

.PHONY:pi
pi:
	env GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

.PHONY: pi-zero
pi-zero:
	env GOARM=6 GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  commands/*.go

.PHONY: test
test:
	go test -cover -race ./...

.PHONY: js-lint
js-lint:
	npm run js-lint

.PHONY: install
install:
	make go-get
	npm install

.PHONY: go-get
go-get:
	go get -u golang.org/x/sys/unix
	go get -u gopkg.in/yaml.v2
	go get -u github.com/kidoman/embd
	go get -u github.com/shirou/gopsutil
	go get -u github.com/gorilla/mux
	go get -u gopkg.in/robfig/cron.v2
	go get -u github.com/dustin/go-humanize
	go get -u github.com/reef-pi/rpi/pwm
	go get -u github.com/reef-pi/drivers
	go get -u github.com/reef-pi/adafruitio
	go get -u github.com/nfnt/resize
	go get -u github.com/coreos/bbolt

.PHONY: vet
vet:
	go vet ./...

.PHONY: build
build: clean go-get test bin

.PHONY: ui
ui:
	npm run ui

.PHONY: ui-dev
ui-dev: 
	npm run ui-dev

.PHONY: deb
deb: ui
	mkdir -p dist/var/lib/reef-pi/assets dist/usr/bin dist/etc/reef-pi
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp assets/favicon.ico dist/var/lib/reef-pi/assets/favicon.ico
	cp assets/home.html dist/var/lib/reef-pi/assets/home.html
	cp assets/ui.js dist/var/lib/reef-pi/assets/ui.js
	cp build/reef-pi.yml dist/etc/reef-pi/config.yml
	mkdir dist/var/lib/reef-pi/images
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: clean
clean:
	-rm -rf *.deb
	-rm -rf dist
	-find jsx -iname __snapshots__ -print | xargs rm -rf
	-find . -name '*.db' -exec rm {} \;
	-find . -name '*.crt' -exec rm {} \;
	-find . -name '*.key' -exec rm {} \;

.PHONY: standard
standard:
	npm run standard

.PHONY: jest
jest:
	npm run jest

.PHONY: start-dev
start-dev:
	DEV_MODE=1 ./bin/reef-pi
