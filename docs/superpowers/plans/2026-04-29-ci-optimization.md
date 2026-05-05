# CI Optimization Plan B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce PR CI wall-clock time by ~50–65% by adding path filters, merging redundant frontend workflows, parallelising Go jobs, and sharing the UI build artifact across the deb matrix.

**Architecture:** Five independent changes applied in sequence: (1) Makefile prebuilt targets that assume `ui/` is already populated, (2) a merged `frontend-checks.yml` replacing the two separate Node workflows, (3) a parallelised `go.yml`, (4) a restructured `deb.yml` with a `build-ui` upstream job, and (5) path filters on `smoke_.yml`. Each change is independently committable and safe to review in isolation.

**Tech Stack:** GitHub Actions YAML, GNU Make, Go 1.26.2, Node 22 / Yarn, Ruby / fpm (for deb packaging)

---

## File Change Map

| File | Action | Responsibility |
|---|---|---|
| `Makefile` | Modify | Add `_dist_layout`, `pi_deb_prebuilt`, `x86_deb_prebuilt` targets |
| `.github/workflows/frontend-checks.yml` | Create | Merged Jest/standard + translations, two parallel jobs, path filters |
| `.github/workflows/jest.yml` | Delete | Replaced by frontend-checks.yml |
| `.github/workflows/translations.yml` | Delete | Replaced by frontend-checks.yml |
| `.github/workflows/go.yml` | Rewrite | Path filter + three parallel jobs: lint, test-coverage, race |
| `.github/workflows/deb.yml` | Rewrite | `build-ui` job + matrix `needs: build-ui` + prebuilt targets + path filter |
| `.github/workflows/smoke_.yml` | Modify | Add path filters only, no structural changes |

**Untouched:** `codeql-analysis.yml`, `claude.yml`, `claude-code-review.yml`, `release.yml`

---

## Task 1: Add Prebuilt Deb Packaging Targets to Makefile

The existing `pi_deb` and `x86_deb` targets depend on `make ui` (full yarn build). The new targets assume `ui/` is already populated (downloaded from a CI artifact) and skip the yarn build entirely.

**Files:**
- Modify: `Makefile`

- [ ] **Step 1: Read the current bottom of the Makefile to find a good insertion point**

  Run: `grep -n "^\.PHONY\|^[a-z_]*:" Makefile`

  You are looking for where `pi_deb` and `x86_deb` are defined (around line 79–85). The new targets go immediately after `x86_deb`.

- [ ] **Step 2: Add the three new targets after `x86_deb`**

  Open `Makefile`. After the `x86_deb` target (the `bundle exec fpm ... -a all ...` block), add:

  ```makefile
  .PHONY: _dist_layout
  _dist_layout:
  	mkdir -p dist/var/lib/reef-pi/ui dist/usr/bin dist/etc/reef-pi dist/var/lib/reef-pi/images
  	cp bin/reef-pi dist/usr/bin/reef-pi
  	cp -r ui/* dist/var/lib/reef-pi/ui
  	cp swagger.json dist/var/lib/reef-pi/ui/assets/swagger.json
  	cp build/config.yaml dist/etc/reef-pi/config.yaml

  .PHONY: pi_deb_prebuilt
  pi_deb_prebuilt: _dist_layout
  	bundle exec fpm -t deb -s dir -a armhf -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .

  .PHONY: x86_deb_prebuilt
  x86_deb_prebuilt: _dist_layout
  	bundle exec fpm -t deb -s dir -a all -n reef-pi -v $(VERSION) -m ranjib@linux.com --deb-systemd build/reef-pi.service -C dist  -p reef-pi-$(VERSION).deb .
  ```

  Use tabs (not spaces) for recipe lines — Make requires tabs.

- [ ] **Step 3: Verify Makefile parses and dry-runs cleanly**

  Run:
  ```bash
  make -n _dist_layout 2>&1
  make -n pi_deb_prebuilt 2>&1
  make -n x86_deb_prebuilt 2>&1
  ```

  Expected output for each: the shell commands printed without execution, no `Makefile:NNN: *** missing separator` errors.

- [ ] **Step 4: Verify existing targets are unchanged**

  Run:
  ```bash
  make -n pi_deb 2>&1 | grep -E "yarn|make ui|fpm"
  make -n x86_deb 2>&1 | grep -E "yarn|make ui|fpm"
  ```

  Expected: output still contains `yarn run ui` in the chain (because `pi_deb` → `common_deb` → `ui`). This confirms the original targets are untouched.

- [ ] **Step 5: Commit**

  ```bash
  git add Makefile
  git commit -m "build: add prebuilt deb targets that skip UI rebuild"
  ```

---

## Task 2: Create `frontend-checks.yml`, Delete `jest.yml` and `translations.yml`

Merges the two single-check Node workflows into one file with two independent parallel jobs. Each job still installs Node + yarn independently (different runners), so they remain independently failable.

**Files:**
- Create: `.github/workflows/frontend-checks.yml`
- Delete: `.github/workflows/jest.yml`
- Delete: `.github/workflows/translations.yml`

- [ ] **Step 1: Create `.github/workflows/frontend-checks.yml`**

  Write the following content exactly:

  ```yaml
  name: Frontend Checks
  on:
    push:
      paths:
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'
    pull_request:
      paths:
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'

  jobs:
    jest-standard:
      name: Jest and Standard
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v6
        - uses: actions/setup-node@v6
          with:
            node-version: 22
        - uses: actions/cache@v4.3.0
          with:
            path: node_modules
            key: ${{ runner.os }}-node_modules-${{ hashFiles('**/yarn.lock') }}
            restore-keys: |
              ${{ runner.os }}-node_modules-
        - name: Install
          run: yarn
        - name: standard
          run: make standard
        - name: jest
          run: yarn run jest-update-snapshot

    translations:
      name: Translations
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v6
        - uses: actions/setup-node@v6
          with:
            node-version: 22
        - uses: actions/cache@v4.3.0
          with:
            path: node_modules
            key: ${{ runner.os }}-node_modules-${{ hashFiles('**/yarn.lock') }}
            restore-keys: |
              ${{ runner.os }}-node_modules-
        - name: Install
          run: yarn
        - name: Check Translations
          run: yarn run translations:chk
  ```

- [ ] **Step 2: Validate YAML syntax**

  Run:
  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/frontend-checks.yml')); print('OK')"
  ```

  Expected: `OK`

- [ ] **Step 3: Delete the old single-check workflow files**

  Run:
  ```bash
  git rm .github/workflows/jest.yml .github/workflows/translations.yml
  ```

  Expected: two lines of output — `rm '.github/workflows/jest.yml'` and `rm '.github/workflows/translations.yml'`

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/frontend-checks.yml
  git commit -m "ci: merge jest and translations into frontend-checks with path filters"
  ```

---

## Task 3: Rewrite `go.yml` — Parallel Jobs + Path Filter

Splits the single sequential job (coverage → lint → race) into three independent parallel jobs. Each checks out and sets up Go separately, using `setup-go@v6`'s built-in module cache. The path filter ensures Go jobs only run when Go-related files change.

**Files:**
- Modify: `.github/workflows/go.yml`

- [ ] **Step 1: Replace the entire content of `.github/workflows/go.yml`**

  Write:

  ```yaml
  name: Go CI
  on:
    push:
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'Makefile'
        - 'scripts/**'
    pull_request:
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'Makefile'
        - 'scripts/**'

  jobs:
    lint:
      name: Lint
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v6
        - uses: actions/setup-go@v6
          with:
            go-version: '1.26.2'
        - run: go install golang.org/x/tools/cmd/goimports@v0.31.0
        - run: make lint

    test-coverage:
      name: Test Coverage
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v6
        - uses: actions/setup-go@v6
          with:
            go-version: '1.26.2'
        - name: Run coverage
          run: make coverage
        - name: Upload coverage to Codecov
          uses: codecov/codecov-action@v5.5.1

    race:
      name: Race / Stress Test
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v6
        - uses: actions/setup-go@v6
          with:
            go-version: '1.26.2'
        - run: make race
  ```

- [ ] **Step 2: Validate YAML syntax**

  Run:
  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/go.yml')); print('OK')"
  ```

  Expected: `OK`

- [ ] **Step 3: Verify job count**

  Run:
  ```bash
  python3 -c "
  import yaml
  wf = yaml.safe_load(open('.github/workflows/go.yml'))
  jobs = list(wf['jobs'].keys())
  print('Jobs:', jobs)
  assert set(jobs) == {'lint', 'test-coverage', 'race'}, 'Wrong jobs'
  print('OK')
  "
  ```

  Expected:
  ```
  Jobs: ['lint', 'test-coverage', 'race']
  OK
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/go.yml
  git commit -m "ci: parallelize go.yml into lint, test-coverage, and race jobs with path filter"
  ```

---

## Task 4: Rewrite `deb.yml` — Shared UI Artifact + Path Filter

Adds a `build-ui` job that runs the yarn build and `make api-doc` once, uploads the `ui/` directory as a workflow artifact, then all three matrix jobs download it instead of rebuilding. Removes `setup-node` and yarn from the matrix jobs entirely.

**Files:**
- Modify: `.github/workflows/deb.yml`

- [ ] **Step 1: Replace the entire content of `.github/workflows/deb.yml`**

  Write:

  ```yaml
  name: Debian Package
  on:
    workflow_call:
    push:
      branches:
        - main
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'
        - 'build/**'
    pull_request:
      branches:
        - main
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'
        - 'build/**'

  jobs:
    build-ui:
      name: Build UI
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v6
        - uses: actions/setup-node@v6
          with:
            node-version: 22
            cache: 'yarn'
        - name: Install
          run: yarn
        - name: Build UI
          run: make ui
        - name: Generate API doc
          run: make api-doc
        - name: Upload UI artifact
          uses: actions/upload-artifact@v5
          with:
            name: ui-dist
            path: ui/
            if-no-files-found: error
            retention-days: 1

    build:
      name: Build Package (${{ matrix.target }})
      runs-on: ubuntu-latest
      needs: build-ui
      strategy:
        matrix:
          target:
            - x86
            - pi0
            - pi3
      steps:
        - name: Checkout
          uses: actions/checkout@v6
          with:
            fetch-depth: 0
        - uses: ruby/setup-ruby@v1
          with:
            ruby-version: 3.2.0
        - uses: actions/setup-go@v6
          with:
            go-version: '1.26.2'
        - name: Download UI artifact
          uses: actions/download-artifact@v6
          with:
            name: ui-dist
            path: ui/
        - name: x86
          if: matrix.target == 'x86'
          run: make x86
        - name: pi-zero
          if: matrix.target == 'pi0'
          run: make pi-zero
        - name: pi
          if: matrix.target == 'pi3'
          run: make pi
        - name: bundler
          run: gem install bundler -v 2.4 --no-document
        - name: fpm
          run: bundle install
        - name: pi_deb
          if: matrix.target != 'x86'
          run: make pi_deb_prebuilt
        - name: x86_deb
          if: matrix.target == 'x86'
          run: make x86_deb_prebuilt
        - name: Rename deb package
          run: |
            VERSION=$(git describe --always --tags)
            mv reef-pi-${VERSION}.deb reef-pi-${VERSION}-${{ matrix.target }}.deb
        - name: "Upload ${{ matrix.target }} deb package"
          uses: actions/upload-artifact@v5
          with:
            name: ${{ matrix.target }}-debian-package
            path: 'reef-pi-*.deb'
            if-no-files-found: error
            retention-days: 30
  ```

- [ ] **Step 2: Validate YAML syntax**

  Run:
  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deb.yml')); print('OK')"
  ```

  Expected: `OK`

- [ ] **Step 3: Verify job structure**

  Run:
  ```bash
  python3 -c "
  import yaml
  wf = yaml.safe_load(open('.github/workflows/deb.yml'))
  jobs = list(wf['jobs'].keys())
  print('Jobs:', jobs)
  assert 'build-ui' in jobs, 'Missing build-ui'
  assert 'build' in jobs, 'Missing build'
  assert wf['jobs']['build']['needs'] == 'build-ui', 'build must need build-ui'
  matrix = wf['jobs']['build']['strategy']['matrix']['target']
  assert set(matrix) == {'x86', 'pi0', 'pi3'}, 'Wrong matrix targets'
  print('matrix targets:', matrix)
  print('OK')
  "
  ```

  Expected:
  ```
  Jobs: ['build-ui', 'build']
  matrix targets: ['x86', 'pi0', 'pi3']
  OK
  ```

- [ ] **Step 4: Verify release.yml compatibility — artifact names unchanged**

  The downstream `release.yml` downloads artifacts by name. Confirm the names in the new `deb.yml` match what `release.yml` expects:

  Run:
  ```bash
  grep "name:" .github/workflows/release.yml | grep "debian-package"
  grep "name:" .github/workflows/deb.yml | grep "debian-package"
  ```

  Expected: both show `x86-debian-package`, `pi0-debian-package`, `pi3-debian-package`.

- [ ] **Step 5: Commit**

  ```bash
  git add .github/workflows/deb.yml
  git commit -m "ci: add build-ui job in deb workflow to share UI artifact across matrix targets"
  ```

---

## Task 5: Add Path Filters to `smoke_.yml`

The smoke test needs both Go and frontend files — it compiles the binary and builds the UI before running Playwright. The path filter is the union of Go and frontend paths. No structural changes.

**Files:**
- Modify: `.github/workflows/smoke_.yml`

- [ ] **Step 1: Replace the `on:` block in `smoke_.yml`**

  The current `on: [push, pull_request]` (line 2) becomes:

  ```yaml
  on:
    push:
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'
    pull_request:
      paths:
        - '**/*.go'
        - 'go.mod'
        - 'go.sum'
        - 'jsx/**'
        - '*.json'
        - 'yarn.lock'
        - 'Makefile'
  ```

  Everything from `jobs:` onward stays exactly as-is.

- [ ] **Step 2: Validate YAML syntax**

  Run:
  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/workflows/smoke_.yml')); print('OK')"
  ```

  Expected: `OK`

- [ ] **Step 3: Verify the jobs block is unchanged**

  Run:
  ```bash
  python3 -c "
  import yaml
  wf = yaml.safe_load(open('.github/workflows/smoke_.yml'))
  steps = wf['jobs']['frontend-smoke']['steps']
  runs = [s.get('run', '') for s in steps]
  assert any('make go' in r for r in runs), 'make go missing'
  assert any('make ui' in r for r in runs), 'make ui missing'
  assert any('make smoke' in r for r in runs), 'make smoke missing'
  assert any('playwright install' in r for r in runs), 'playwright install missing'
  print('All smoke steps intact. OK')
  "
  ```

  Expected: `All smoke steps intact. OK`

- [ ] **Step 4: Commit**

  ```bash
  git add .github/workflows/smoke_.yml
  git commit -m "ci: add path filters to smoke workflow"
  ```

---

## Verification Checklist (after all tasks)

Run these after all commits to confirm nothing was accidentally lost:

```bash
# All expected workflow files exist
ls .github/workflows/
# Expected: claude-code-review.yml  claude.yml  codeql-analysis.yml
#           deb.yml  frontend-checks.yml  go.yml  release.yml  smoke_.yml
# NOT expected: jest.yml  translations.yml

# Confirm jest.yml and translations.yml are gone
test ! -f .github/workflows/jest.yml && echo "jest.yml deleted OK"
test ! -f .github/workflows/translations.yml && echo "translations.yml deleted OK"

# Validate all modified/created YAML files
for f in .github/workflows/go.yml .github/workflows/deb.yml \
          .github/workflows/frontend-checks.yml .github/workflows/smoke_.yml; do
  python3 -c "import yaml; yaml.safe_load(open('$f')); print('$f OK')"
done

# Confirm Makefile new targets parse
make -n _dist_layout 2>&1 | grep -v "^make" | head -5
make -n pi_deb_prebuilt 2>&1 | grep "fpm"
make -n x86_deb_prebuilt 2>&1 | grep "fpm"

# Confirm original targets still intact
make -n pi_deb 2>&1 | grep "fpm"
make -n x86_deb 2>&1 | grep "fpm"
```
