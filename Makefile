SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION:=$(shell git describe --always --tags)
BINARY=bin/reef-pi
DETECT_RACE='-race'

ifeq ($(OS), Windows_NT)
	BINARY=./bin/reef-pi.exe
	DETECT_RACE=
endif

.PHONY:bin
bin:
	make go
	make build-ui

.PHONY:build-ui
build-ui:
	yarn run build

.PHONY:go
go:
	go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  ./commands

.PHONY:pi
pi:
	env GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  ./commands

.PHONY: pi-zero
pi-zero:
	env GOARM=6 GOOS=linux GOARCH=arm go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  ./commands

.PHONY: test
test:
	go test -count=1 -cover $(DETECT_RACE) ./...

.PHONY: js-lint
js-lint:
	yarn run js-lint

.PHONY: sass-lint
sass-lint:
	yarn run sass-lint

.PHONY: install
install:
	make go-get
	yarn

.PHONY: go-get
go-get:
	go get -u golang.org/x/tools/cmd/goimports
ifeq ($(OS), Windows_NT)
	go get -u github.com/StackExchange/wmi
endif

.PHONY: vet
vet:
	go vet ./...

.PHONY: imports
imports:
	goimports -w -local github.com/reef-pi/reef-pi -d ./controller

.PHONY: build
build: clean go-get test bin

.PHONY: ui
ui:
	yarn run ui

.PHONY: ui-dev
ui-dev:
	yarn run ui-dev

.PHONY: deb
deb: ui api-doc
	mkdir -p dist/var/lib/reef-pi/ui dist/usr/bin dist/etc/reef-pi
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp -r ui/* dist/var/lib/reef-pi/ui
	cp build/config.yaml dist/etc/reef-pi/config.yaml
	mkdir dist/var/lib/reef-pi/images
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: clean
clean:
	-rm -rf *.deb
	-rm -rf dist
	-rm -rf ui
	-rm -rf bin/*
	-find jsx -iname __snapshots__ -print | xargs rm -rf
	-find . -name '*.db' -exec rm {} \;
	-find . -name '*.crt' -exec rm {} \;
	-find . -name '*.key' -exec rm {} \;

.PHONY: standard
standard:
	yarn run standard

.PHONY: jest
jest:
	yarn run jest

.PHONY: start-dev
start-dev:
ifeq ($(OS), Windows_NT)
	set DEV_MODE=1
	$(BINARY)
else
	DEV_MODE=1 $(BINARY)
endif

.PHONY: race
race:
	./scripts/race.sh 12

.PHONY: spec
spec:
	swagger generate spec /w ./commands/ -i swagger.yml -o swagger.json -m

.PHONY: serve-spec
serve-spec:
	npx redoc-cli serve swagger.json -p 8888
api-doc:
	npx redoc-cli bundle swagger.json -o ui/assets/api.html

.PHONY: smoke
smoke:
	yarn run ci-smoke
