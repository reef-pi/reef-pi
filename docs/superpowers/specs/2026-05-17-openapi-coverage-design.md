# OpenAPI 3.0 Full Coverage Design

**Date:** 2026-05-17  
**Status:** Approved  
**Goal:** Migrate reef-pi from Swagger 2.0 (go-swagger, ~32% response schema coverage) to OpenAPI 3.0 (spec-first, oapi-codegen strict mode, 100% coverage) with a simultaneous gorilla/mux → chi router migration.

---

## Audit Summary

Current state before this work:

| Metric | Value |
|---|---|
| Total API operations | 117 |
| Operations with response schema | 37 (32%) |
| Operations missing response schema | 80 (68%) |
| Model definitions | 44 |
| Modules with zero annotations | 1 (journal) |
| Spec format | Swagger 2.0 |
| Generator | go-swagger comment annotations |

Root cause: routes are declared via `// swagger:route` / `// swagger:operation` comments but most lack YAML parameter/response blocks. Comment-based annotations have no compile-time enforcement — they silently diverge from code.

---

## Decision

**Approach:** Spec-first with `oapi-codegen` (strict server mode) + chi router.

**Why spec-first over comment-driven (swaggo/swag):**  
`swaggo/swag` is more mainstream but not type-safe — comments and Go structs are independent artifacts that can drift. Spec-first with codegen enforces the contract at compile time: if a handler doesn't match the generated interface, the build fails.

**Why oapi-codegen over huma v2:**  
huma v2 requires a framework-level buy-in (chi/stdlib only) and is the more ambitious long-term destination. oapi-codegen works with chi and keeps handler logic in the existing modules — less structural disruption.

**Why chi over keeping gorilla/mux:**  
gorilla/mux is in maintenance mode. chi is API-compatible (same `{id}` path syntax, same stdlib `http.Handler`), actively maintained, and is oapi-codegen's most common target. The migration is mechanical: `mux.Vars(r)["id"]` → `chi.URLParam(r, "id")` in 4 places.

---

## File Layout

```
openapi/
  openapi.yaml              # root: info, servers, security schemes, $ref to paths
  paths/
    auth.yaml               # /auth/signin, /auth/signout, /api/credentials
    core.yaml               # /api/settings, /api/capabilities, /api/me, /api/dashboard, /api/errors
    system.yaml             # /api/display, /api/admin/*, /api/info
    telemetry.yaml          # /api/telemetry
    equipment.yaml          # /api/equipment
    lighting.yaml           # /api/lights
    ato.yaml                # /api/atos
    ph.yaml                 # /api/phprobes
    temperature.yaml        # /api/tcs
    timer.yaml              # /api/timers
    doser.yaml              # /api/doser/pumps
    camera.yaml             # /api/camera
    macro.yaml              # /api/macros
    journal.yaml            # /api/journal
    drivers.yaml            # /api/drivers
    connectors.yaml         # /api/inlets, /api/outlets, /api/jacks, /api/analog_inputs
  schemas/
    equipment.yaml
    lighting.yaml
    ato.yaml
    ph.yaml
    temperature.yaml
    timer.yaml
    doser.yaml
    camera.yaml
    macro.yaml
    journal.yaml
    system.yaml
    telemetry.yaml
    drivers.yaml
    connectors.yaml
    core.yaml               # settings, capabilities, dashboard, error
    errors.yaml             # shared error responses (400, 401, 404, 500)

controller/api/
  generate.go               # //go:generate directive, hand-written
  gen/
    types.gen.go            # all OA3 schema types, DO NOT EDIT
    server.gen.go           # StrictServerInterface + chi route registration, DO NOT EDIT
  impl.go                   # ReefPiServer aggregate struct, delegates to module controllers
                            # constructed in daemon.ReefPi.API() alongside other module setup

oapi-codegen.yaml           # codegen config at repo root
```

**Why split paths by module:** Each Phase 2 PR touches exactly one `paths/<module>.yaml` and one `schemas/<module>.yaml` alongside the module's handler code. Reviewers see spec and implementation in the same diff.

**Why commit generated files:** Build works without running `oapi-codegen` in CI. The `gen/` directory name signals do-not-hand-edit. Regeneration check in CI catches drift.

---

## oapi-codegen Configuration

**`oapi-codegen.yaml`:**
```yaml
package: gen
output: controller/api/gen/
generate:
  - chi-server     # StrictServerInterface + chi route registration
  - strict-server  # typed request/response wrappers
  - types          # Go structs for all OA3 schema components
  - spec           # embeds openapi.yaml into binary for runtime serving
```

**`controller/api/generate.go`:**
```go
package api

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen --config=../../oapi-codegen.yaml ../../openapi/openapi.yaml
```

---

## Authentication

reef-pi uses cookie-based session auth. OA3 representation:

```yaml
# openapi/openapi.yaml
components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: reef-pi-session

security:
  - sessionAuth: []    # global default: all routes require auth
```

`/auth/signin` and `/auth/signout` override with `security: []`. No other route needs to declare security.

---

## Phase Plan

### Phase 0 — Scaffold (1 PR)

- Add `oapi-codegen` to `go.mod` tool dependencies
- Create `oapi-codegen.yaml`
- Create empty `openapi/openapi.yaml` (info, servers, security scheme, empty paths)
- Create `controller/api/generate.go` with `//go:generate`
- Run `go generate` — produces empty-but-valid `gen/types.gen.go` and `gen/server.gen.go`
- Commit generated files

Acceptance: `go generate ./controller/api/...` runs cleanly; `go build` passes.

---

### Phase 1 — gorilla/mux → chi (1 PR)

**Files changed:**

`go.mod` — add `github.com/go-chi/chi/v5`, `github.com/go-chi/cors`; remove `github.com/gorilla/mux`.

`controller/utils/http_json.go` — replace `mux.Vars(r)["id"]` with `chi.URLParam(r, "id")` in 3 functions (`JSONGetResponse`, `JSONUpdateResponse`, `JSONDeleteResponse`). Remove gorilla import.

`controller/device_manager/device_manager.go` — same 1-line swap.

`controller/daemon/api.go` — swap router construction:
```go
// before
root := mux.NewRouter()
apiRouter := mux.NewRouter()
apiRouter.Use(corsMiddleware)
root.PathPrefix("/api/").Handler(r.a.Authenticate(apiRouter.ServeHTTP))

// after
root := chi.NewRouter()
apiRouter := chi.NewRouter()
apiRouter.Use(cors.Handler(cors.Options{AllowedOrigins: []string{"*"}, AllowedMethods: []string{"*"}, AllowedHeaders: []string{"*"}}))
root.Mount("/api/", r.a.Authenticate(apiRouter))
```
Delete inline `corsMiddleware` function.

All 14 `api.go` files — route registration syntax:
```go
// before
router.HandleFunc("/api/equipment/{id}", e.GetEquipment).Methods("GET")

// after
r.Get("/api/equipment/{id}", e.GetEquipment)
```

Acceptance: `make test` green. No handler logic changes; no test changes.

---

### Phase 2 — Spec + Codegen Per Module (~14 PRs)

Each module PR follows this exact sequence:

1. **Write `openapi/paths/<module>.yaml`** — all operations with full request/response schemas, `operationId`, `tags`, `security` reference.
2. **Write `openapi/schemas/<module>.yaml`** — OA3 schema for the module's domain models (derived from existing Go structs).
3. **Add `$ref` in `openapi/openapi.yaml`** — one line pointing to the new paths file.
4. **Run `go generate ./controller/api/...`** — `types.gen.go` and `server.gen.go` update; build fails until handlers are implemented.
5. **Refactor module handlers to implement the generated interface:**

```go
// before
func (e *Controller) GetEquipment(w http.ResponseWriter, r *http.Request) {
    utils.JSONGetResponse(func(id string) (interface{}, error) {
        return e.store.Get(id)
    }, w, r)
}

// after
func (e *Controller) GetEquipment(ctx context.Context, req gen.GetEquipmentRequestObject) (gen.GetEquipmentResponseObject, error) {
    item, err := e.store.Get(req.Id)
    if err != nil {
        return gen.GetEquipment404JSONResponse{Message: err.Error()}, nil
    }
    return gen.GetEquipment200JSONResponse(item), nil
}
```

6. **Delete the module's `LoadAPI` method** — generated router wiring replaces it.
7. **Add delegation methods to `controller/api/impl.go`** (~5–10 lines per module).

**Acceptance per module:** `make test` passes, `redocly lint openapi/openapi.yaml` passes, new paths appear in served spec with full schemas.

**Recommended module order** (simplest → most complex):
1. core (settings, capabilities, me, dashboard, errors)
2. system (display, admin, info)
3. telemetry
4. equipment
5. timer
6. macro
7. journal
8. camera
9. ato
10. lighting
11. temperature
12. ph
13. doser
14. drivers
15. connectors (inlets, outlets, jacks, analog_inputs — one PR, four resource types)

---

### Phase 3 — Remove Legacy Tooling (1 PR)

Once all modules are migrated:

- Delete `swagger.yml` (Swagger 2.0 input)
- Delete `swagger.json` (generated, replaced by embedded OA3 spec)
- Delete `controller/utils/doc.go` (`APIDoc`, `SummarizeAPI` — no longer called)
- Remove `swagger generate spec` target from `Makefile`; add `make spec` alias for `go generate ./controller/api/...`
- Remove `go-swagger` from `go.mod` tool dependencies
- Update `api-doc` Makefile target to serve `openapi/openapi.yaml` via the embedded spec endpoint instead of `swagger.json`
- Update `_dist_layout` to copy `openapi.yaml` instead of `swagger.json`

---

## CI Enforcement

Two checks added to `make test`:

**Regeneration check** — prevents spec/code drift:
```bash
go generate ./controller/api/...
git diff --exit-code controller/api/gen/
```
Fails if `openapi.yaml` changed without regenerating, or if generated files were hand-edited.

**Spec lint** — validates OA3 correctness:
```bash
npx @redocly/cli lint openapi/openapi.yaml
```
Catches broken `$ref`s, missing `operationId`, malformed schemas. `@redocly/openapi-core` is already in `node_modules`.

---

## Deleted After Full Migration

| Artifact | Reason |
|---|---|
| `swagger.yml` | Swagger 2.0 input, replaced by `openapi/openapi.yaml` |
| `swagger.json` | Generated output, replaced by embedded OA3 spec |
| `openapi.yaml` (root) | Abandoned OA3 skeleton, superseded by `openapi/openapi.yaml` |
| `controller/utils/doc.go` | `APIDoc`/`SummarizeAPI` replaced by codegen |
| All `// swagger:route` comments | Replaced by spec |
| All `// swagger:model` comments | Types now live in `gen/types.gen.go` |
| All `LoadAPI(router)` methods | Route registration owned by generated `HandlerFromMux` |
| `utils.JSONGetResponse` et al. | Replaced by typed strict-mode handler pattern |

---

## Success Criteria

- `go build` passes with zero `gorilla/mux` imports
- `redocly lint openapi/openapi.yaml` passes with zero errors
- All 117 operations have request schemas (where applicable) and response schemas
- Regeneration CI check passes (no drift between spec and generated code)
- Existing test suite passes unchanged (handler logic untouched)
