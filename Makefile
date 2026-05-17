SOURCEDIR=.
SOURCES = $(shell find $(SOURCEDIR) -name '*.go')
VERSION:=$(shell git describe --always --tags)
BINARY=bin/reef-pi
DETECT_RACE='-race'
GO_TEST_PACKAGES=$(shell go list -f '{{if or .TestGoFiles .XTestGoFiles}}{{.ImportPath}}{{end}}' ./commands ./controller/...)

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

.PHONY:x86
x86:
	env GOOS=linux GOARCH=amd64 go build -o $(BINARY) -ldflags "-s -w -X main.Version=$(VERSION)"  ./commands

.PHONY: test
test:
	go test -count=1 -cover $(DETECT_RACE) $(GO_TEST_PACKAGES)

.PHONY: coverage
coverage:
	go test -race -coverprofile=coverage.txt -covermode=atomic $(GO_TEST_PACKAGES)

.PHONY: js-lint
js-lint:
	yarn run js-lint

.PHONY: sass-lint
sass-lint:
	yarn run sass-lint

.PHONY: install
install:
	yarn

.PHONY: lint
lint:
	go fmt ./...
	goimports -w -local github.com/reef-pi/reef-pi -d ./controller
	go vet ./...

.PHONY: build
build: clean go-get test bin

.PHONY: ui
ui:
	yarn run ui

.PHONY: ui-dev
ui-dev:
	yarn run ui-dev

.PHONY: common_deb
common_deb: ui api-doc _dist_layout

.PHONY: pi_deb
pi_deb: common_deb
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: x86_deb
x86_deb: common_deb
	bundle exec fpm -t deb -s dir -a all -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

# Internal helper: populate dist/ from a pre-built ui/ and bin/reef-pi. Called by
# common_deb (via prerequisites) and pi_deb_prebuilt/x86_deb_prebuilt.
.PHONY: _dist_layout
_dist_layout:
	@test -d ui || (echo "ERROR: ui/ not found. Run 'make ui' or download the CI artifact." && exit 1)
	mkdir -p dist/var/lib/reef-pi/ui dist/usr/bin dist/etc/reef-pi dist/var/lib/reef-pi/images
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp -r ui/* dist/var/lib/reef-pi/ui
	cp build/config.yaml dist/etc/reef-pi/config.yaml

.PHONY: pi_deb_prebuilt
pi_deb_prebuilt: _dist_layout
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

.PHONY: x86_deb_prebuilt
x86_deb_prebuilt: _dist_layout
	bundle exec fpm -t deb -s dir -a all -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

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
	go generate ./controller/api/...

.PHONY: lint-spec
lint-spec:
	npx @redocly/cli lint openapi/openapi.yaml

.PHONY: serve-spec
serve-spec:
	npx @redocly/cli preview-docs openapi/openapi.yaml -p 8888

.PHONY: check-spec
check-spec:
	go generate ./controller/api/...
	git diff --exit-code controller/api/gen/

.PHONY: api-doc
api-doc:
	printf '%s\n' \
	'<!DOCTYPE html>' \
	'<html>' \
	'  <head>' \
	'    <meta charset="utf-8" />' \
	'    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />' \
	'    <title>reef-pi API</title>' \
	'    <style>' \
	'      body { margin: 0; padding: 0; }' \
	'    </style>' \
	'  </head>' \
	'  <body>' \
	'    <redoc spec-url="/assets/openapi.yaml"></redoc>' \
	'    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>' \
	'  </body>' \
	'</html>' > ui/assets/api.html

.PHONY: smoke
smoke:
	yarn run smoke
