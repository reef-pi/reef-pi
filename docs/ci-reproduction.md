# CI Reproduction Guide

This file captures the local command equivalents for the repository workflows so CI failures can be reproduced without guesswork.

## Go CI

Workflow: `.github/workflows/go.yml`

Use Go `1.26.2` for local reproduction.

```bash
go test -race -coverprofile=coverage.txt -covermode=atomic ./...
go install golang.org/x/tools/cmd/goimports@latest
make lint
make race
```

## Frontend Jest

Workflow: `.github/workflows/jest.yml`

```bash
yarn
make standard
yarn run jest-update-snapshot
```

## Frontend Smoke

Workflow: `.github/workflows/smoke_.yml`

```bash
make install
make go
make ui
make start-dev &
make smoke
```

Stop the background `reef-pi` process after the smoke run completes.

## Debian Package

Workflow: `.github/workflows/deb.yml`

Shared setup:

```bash
yarn
gem install bundler -v 2.4 --no-document
bundle install
```

Per target:

```bash
make x86
make x86_deb
```

```bash
make pi-zero
make pi_deb
```

```bash
make pi
make pi_deb
```

## Translations

Workflow: `.github/workflows/translations.yml`

```bash
yarn
yarn run translations:chk
```

## CodeQL

Workflow: `.github/workflows/codeql-analysis.yml`

CodeQL itself runs inside GitHub Actions, but the most common local checks for touched code are:

```bash
go test ./...
make lint
yarn
make standard
make jest
```
