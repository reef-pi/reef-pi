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

## UI Audit

Workflow: `.github/workflows/ui-audit.yml`

The UI audit captures the seeded reef-pi module corpus, checks objective browser facts against the design-system rules, and writes agent-ready artifacts.

Run locally from the repo root:

```bash
rtk yarn run ui-audit
```

Artifacts are written to:

- `test-results/ui-audit/manifest.json`
- `test-results/ui-audit/agent-report.json`
- `test-results/ui-audit/agent-report.md`
- `test-results/ui-audit/prompts/`
- `test-results/ui-audit/screenshots/`

A non-zero exit means the audit found objective failures such as missing screenshots, fatal app text, unexpected failed app/API requests, or missing audit anchors. Tap-target and overflow observations are recorded as warnings for design review prompts and do not block CI by themselves.
