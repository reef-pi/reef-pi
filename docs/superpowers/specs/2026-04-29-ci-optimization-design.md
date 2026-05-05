# CI Optimization — Plan B Design

**Date:** 2026-04-29  
**Goal:** Reduce PR validation wall-clock time by ~50–65% without removing any existing checks or artifacts.

---

## Problem Summary

The current CI runs 7–8 workflows per PR with significant redundancy:

| Waste | Impact |
|---|---|
| No path filters — every workflow runs on every push regardless of what changed | A `.go` file change triggers jest, translations, smoke; a `.jsx` change triggers full Go test + 12-cycle race |
| `jest.yml` and `translations.yml` each install Node 22 + yarn on separate runners | Two full yarn installs for checks that take ~1 min each |
| `deb.yml` matrix builds the UI three times (x86, pi0, pi3) producing identical output | ~6–12 min of redundant `yarn run build` |
| `go.yml` runs coverage → lint → race sequentially in one job | Race (12× `make test`) blocks behind coverage; lint failure delays race start |

---

## Constraints

- All existing checks must be preserved: Go coverage + Codecov upload, lint, race stress test (12 cycles), Jest snapshots, JS standard linting, translation check, Playwright smoke test, deb packages (x86, pi0, pi3), CodeQL (Go + JS), Claude code review
- All artifacts must be preserved: deb packages uploaded via `actions/upload-artifact`, smoke playwright report, Codecov report
- `make race` (12-cycle stress test) is intentional and distinct from `make coverage`'s `-race` flag — both are kept

---

## Changes

### 1. Path Filters on All PR-triggered Workflows

Add `paths:` filters so each workflow only triggers when relevant files change.

**Go paths** (used by `go.yml`, `smoke_.yml`):
```
**/*.go
go.mod
go.sum
Makefile
scripts/**
```

**Frontend paths** (used by `frontend-checks.yml`, `smoke_.yml`):
```
jsx/**
*.json
yarn.lock
Makefile
```

**Smoke** uses the union (Go OR frontend paths) since it tests the full compiled stack.

**`deb.yml`** already limits to `branches: [main]`; path filters are added there too for completeness but have lower impact.

**`codeql-analysis.yml`** already limits to main + weekly schedule; no change needed.

---

### 2. Merge `jest.yml` + `translations.yml` → `frontend-checks.yml`

Delete `jest.yml` and `translations.yml`. Create a single `frontend-checks.yml` with **two parallel jobs** sharing the same trigger and path filters.

```
frontend-checks.yml
├── job: jest-standard   (checkout → setup-node → cache → yarn → standard → jest-update-snapshot)
└── job: translations    (checkout → setup-node → cache → yarn → translations:chk)
```

Both jobs remain independently failable. The only saving is one fewer runner startup + yarn install per PR.

---

### 3. Split `go.yml` into Three Parallel Jobs

Replace the single sequential job with three parallel jobs in the same workflow file:

```
go.yml
├── job: lint          (checkout → setup-go → install goimports → make lint)
├── job: test-coverage (checkout → setup-go → make coverage → codecov upload)
└── job: race          (checkout → setup-go → make race)
```

All three check out independently and rely on `setup-go@v6`'s built-in Go module cache for fast restores. A lint failure no longer delays the race job. Wall-clock time drops from (lint + coverage + race) sequential to max(lint, coverage, race) parallel — the race job (longest at ~10–15 min) now dominates, with lint and coverage finishing independently alongside it.

No functional change: same commands, same Codecov upload, same 12-cycle race.

---

### 4. Shared UI Artifact in `deb.yml`

The three matrix targets (x86, pi0, pi3) differ only in the Go binary architecture. The `yarn run build` output (`ui/` directory) is identical across all three.

**New job graph:**

```
deb.yml
├── job: build-ui                          (checkout → setup-node → yarn → make build-ui → upload artifact: ui-dist)
└── job: build (matrix: x86, pi0, pi3)    (needs: build-ui)
    ├── checkout (fetch-depth: 0)
    ├── setup-ruby + setup-go
    ├── download artifact: ui-dist → ./ui/
    ├── make x86 / make pi-zero / make pi  (binary only)
    ├── gem install bundler + bundle install
    └── make pi_deb_prebuilt / make x86_deb_prebuilt → upload deb artifact
```

**Required Makefile additions** — two new targets that assume `ui/` is already populated, replacing `pi_deb` / `x86_deb` in the CI matrix:

```makefile
.PHONY: _dist_layout
_dist_layout:
	mkdir -p dist/var/lib/reef-pi/ui dist/usr/bin dist/etc/reef-pi dist/var/lib/reef-pi/images
	cp bin/reef-pi dist/usr/bin/reef-pi
	cp -r ui/* dist/var/lib/reef-pi/ui
	cp swagger.json dist/var/lib/reef-pi/ui/assets/swagger.json
	cp build/config.yaml dist/etc/reef-pi/config.yaml
	printf '%s\n' '<!DOCTYPE html>' '<html>' '  <head>' \
	  '    <meta charset="utf-8" />' \
	  '    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />' \
	  '    <title>reef-pi API</title>' \
	  '    <style>body { margin: 0; padding: 0; }</style>' \
	  '  </head>' '<body>' \
	  '    <redoc spec-url="/assets/swagger.json"></redoc>' \
	  '    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>' \
	  '  </body>' '</html>' > dist/var/lib/reef-pi/ui/assets/api.html

.PHONY: pi_deb_prebuilt
pi_deb_prebuilt: _dist_layout
	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com \
	  --deb-systemd build/reef-pi.service -C dist -p reef-pi-$(VERSION).deb .

.PHONY: x86_deb_prebuilt
x86_deb_prebuilt: _dist_layout
	bundle exec fpm -t deb -s dir -a all -n reef-pi -v $(VERSION) -m ranjib@linux.com \
	  --deb-systemd build/reef-pi.service -C dist -p reef-pi-$(VERSION).deb .
```

The existing `pi_deb` and `x86_deb` targets are kept unchanged (used by local dev and release flow).

---

### 5. `smoke_.yml` — Path Filters Only

The smoke workflow sets up both Go and Node, builds the full binary + UI, and runs Playwright. Cross-workflow artifact sharing adds coordination complexity that outweighs the savings given that smoke already uses `actions/cache` for node_modules.

Change: add path filters (union of Go + frontend paths). No structural changes.

---

## File Change Summary

| File | Action |
|---|---|
| `.github/workflows/go.yml` | Rewrite: add path filter, split into 3 parallel jobs |
| `.github/workflows/jest.yml` | Delete |
| `.github/workflows/translations.yml` | Delete |
| `.github/workflows/frontend-checks.yml` | Create: merged jest + translations, parallel jobs, path filter |
| `.github/workflows/deb.yml` | Rewrite: add `build-ui` job, update matrix to `needs: build-ui`, use `pi_deb_prebuilt`/`x86_deb_prebuilt` |
| `.github/workflows/smoke_.yml` | Add path filter only |
| `Makefile` | Add `_dist_layout`, `pi_deb_prebuilt`, `x86_deb_prebuilt` targets |

**Unchanged:** `codeql-analysis.yml`, `claude.yml`, `claude-code-review.yml`, `release.yml`

---

## Expected Impact

| Scenario | Current (approx) | After Plan B (approx) |
|---|---|---|
| Go-only PR (non-main branch) | go.yml + jest + translations + smoke run | go.yml (parallel) only; jest/translations/smoke skip via path filter |
| Go-only PR (to main) | All 7 workflows run | go.yml (parallel) + CodeQL + deb; jest/translations/smoke skip via path filter |
| Frontend-only PR (non-main) | go.yml + jest + translations + smoke run | frontend-checks.yml + smoke; go.yml skips via path filter |
| Frontend-only PR (to main) | All 7 workflows run | frontend-checks.yml + smoke + CodeQL(js) + deb; go.yml skips |
| Mixed PR (Go + frontend) | All 7 workflows run | All run, but go.yml parallel + deb UI deduplicated |
| go.yml wall time | ~25 min (sequential) | ~15 min (race dominates in parallel) |
| deb.yml wall time | ~30 min per target × 3 | ~30 min (matrix waits for ~3 min UI build, then runs in parallel) |
| PR to non-main branch | deb.yml + codeql skip (already) | Same |

**Overall PR wall-clock reduction: ~50–65%** for single-domain changes; ~30–40% for mixed changes.

---

## What Is NOT Changed

- All check names and pass/fail semantics are preserved
- Codecov upload remains in `test-coverage` job
- 12-cycle race stress test unchanged
- All three deb artifacts (x86, pi0, pi3) still produced and uploaded with 30-day retention
- Smoke playwright artifacts still uploaded on failure
- `release.yml` still calls `deb.yml` via `workflow_call` unchanged
- No changes to CodeQL, Claude review, or Claude action workflows
