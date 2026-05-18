# OpenAPI 3.0 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate reef-pi from Swagger 2.0 comment annotations to OpenAPI 3.0 spec-first with `oapi-codegen` strict mode and chi router, achieving 100% request/response schema coverage.

**Architecture:** Write OA3 spec in `openapi/openapi.yaml` (split by module under `openapi/paths/`), run `oapi-codegen` to generate typed Go interfaces in `controller/api/gen/`, and implement those interfaces per module. Simultaneously swap gorilla/mux for chi — a mechanical change since `mux.Vars` is only used in 4 places and all handlers use stdlib `http.Handler`.

**Tech Stack:** `github.com/go-chi/chi/v5`, `github.com/go-chi/cors`, `github.com/oapi-codegen/oapi-codegen/v2`, Go 1.26.

---

## File Map

### New files
- `oapi-codegen.yaml` — codegen config at repo root
- `openapi/openapi.yaml` — OA3 root document
- `openapi/paths/` — one YAML per module (added per Phase 2 PR)
- `openapi/schemas/` — one YAML per domain model (added per Phase 2 PR)
- `controller/api/generate.go` — `//go:generate` directive
- `controller/api/gen/api.gen.go` — generated types + server interface + chi wiring (DO NOT EDIT)
- `controller/api/impl.go` — `ReefPiServer` aggregate struct delegating to module controllers

### Modified in Phase 1
- `go.mod` / `go.sum` — add chi, cors; remove gorilla/mux
- `controller/controller.go` — `Subsystem.LoadAPI(*mux.Router)` → `chi.Router`
- `controller/noop.go` — mock implementation of LoadAPI
- `controller/subsystem_composite.go` — LoadAPI signature
- `controller/utils/http_json.go` — 3× `mux.Vars` → `chi.URLParam`
- `controller/device_manager/device_manager.go` — 1× `mux.Vars` + LoadAPI signature
- `controller/device_manager/drivers/api.go` — LoadAPI + route syntax
- `controller/device_manager/connectors/inlet.go` — LoadAPI + route syntax
- `controller/device_manager/connectors/outlet.go` — LoadAPI + route syntax
- `controller/device_manager/connectors/jack.go` — LoadAPI + route syntax
- `controller/device_manager/connectors/analog_input.go` — LoadAPI + route syntax
- `controller/daemon/api.go` — full router rewrite
- `controller/modules/ato/api.go` — LoadAPI + route syntax
- `controller/modules/camera/api.go` — LoadAPI + route syntax
- `controller/modules/doser/api.go` — LoadAPI + route syntax
- `controller/modules/equipment/api.go` — LoadAPI + route syntax
- `controller/modules/journal/api.go` — LoadAPI + route syntax
- `controller/modules/lighting/api.go` — LoadAPI + route syntax
- `controller/modules/macro/api.go` — LoadAPI + route syntax
- `controller/modules/ph/api.go` — LoadAPI + route syntax
- `controller/modules/system/api.go` — LoadAPI + route syntax
- `controller/modules/temperature/api.go` — LoadAPI + route syntax
- `controller/modules/timer/api.go` — LoadAPI + route syntax
- `controller/telemetry/api.go` — LoadAPI + route syntax

---

## Phase 0: Foundation

### Task 1: Add oapi-codegen dependency and config

**Files:**
- Create: `oapi-codegen.yaml`
- Create: `controller/api/generate.go`
- Modify: `go.mod`

- [ ] **Step 1: Add oapi-codegen as a tool dependency**

```bash
go get github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
```

- [ ] **Step 2: Create the codegen config at repo root**

Create `oapi-codegen.yaml`:
```yaml
package: gen
generate:
  chi-server: true
  strict-server: true
  models: true
  embedded-spec: true
output: controller/api/gen/api.gen.go
```

- [ ] **Step 3: Create the generate.go file**

Create `controller/api/generate.go`:
```go
package api

//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen --config ../../oapi-codegen.yaml ../../openapi/openapi.yaml
```

- [ ] **Step 4: Commit**

```bash
git add oapi-codegen.yaml controller/api/generate.go go.mod go.sum
git commit -m "[claude design] feat: add oapi-codegen config and go:generate directive"
```

---

### Task 2: Create the OpenAPI root document

**Files:**
- Create: `openapi/openapi.yaml`

- [ ] **Step 1: Create the directory and root spec**

```bash
mkdir -p openapi/paths openapi/schemas
```

Create `openapi/openapi.yaml`:
```yaml
openapi: 3.0.3
info:
  title: reef-pi API
  description: REST API for the reef-pi aquarium controller
  version: 0.0.1
servers:
  - url: /
    description: Local reef-pi instance
components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: auth
      description: >
        Session cookie set by POST /auth/signin. Required for all /api/* routes.
  schemas:
    ErrorResponse:
      type: object
      required: [message]
      properties:
        message:
          type: string
security:
  - sessionAuth: []
paths: {}
```

- [ ] **Step 2: Commit**

```bash
git add openapi/
git commit -m "[claude design] feat: add empty OpenAPI 3.0 root document"
```

---

### Task 3: Run codegen and commit the empty scaffold

**Files:**
- Create: `controller/api/gen/api.gen.go`

- [ ] **Step 1: Run go generate**

```bash
go generate ./controller/api/...
```

Expected: `controller/api/gen/api.gen.go` is created. With `paths: {}` it will be a valid but nearly empty file — just the package declaration, imports, and the embedded spec.

- [ ] **Step 2: Verify it compiles**

```bash
go build ./controller/api/...
```

Expected: exits 0 with no output.

- [ ] **Step 3: Commit the generated file**

```bash
git add controller/api/gen/
git commit -m "[claude design] feat: add empty generated API scaffold"
```

---

## Phase 1: gorilla/mux → chi

### Task 4: Add chi, remove gorilla/mux from go.mod

**Files:**
- Modify: `go.mod`, `go.sum`

- [ ] **Step 1: Add chi dependencies**

```bash
go get github.com/go-chi/chi/v5@latest
go get github.com/go-chi/cors@latest
```

- [ ] **Step 2: Verify gorilla/mux is still present (will be removed by tidy after all usages replaced)**

```bash
grep "gorilla/mux" go.mod
```

Expected: `github.com/gorilla/mux v1.8.1` — it stays until all usages are removed in later steps.

- [ ] **Step 3: Commit**

```bash
git add go.mod go.sum
git commit -m "[claude design] feat: add chi/v5 and chi/cors dependencies"
```

---

### Task 5: Update the Subsystem interface

The `Subsystem` interface in `controller/controller.go` declares `LoadAPI(*mux.Router)`. All 19 implementations must be updated. Change the interface first so the compiler catches every implementation that needs updating.

**Files:**
- Modify: `controller/controller.go`

- [ ] **Step 1: Update the interface**

In `controller/controller.go`, change line 4 import and line 13:

```go
package controller

import (
	"github.com/go-chi/chi/v5"

	"github.com/reef-pi/reef-pi/controller/device_manager"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/telemetry"
)

type Subsystem interface {
	Setup() error
	LoadAPI(chi.Router)
	Start()
	Stop()
	On(string, bool) error
	InUse(string, string) ([]string, error)
	GetEntity(string) (Entity, error)
}
```

- [ ] **Step 2: Verify the build fails with a clear list of unimplemented methods**

```bash
go build ./... 2>&1 | grep "does not implement\|cannot use" | head -30
```

Expected: multiple errors listing every LoadAPI implementation — these are the 19 files to update next.

---

### Task 6: Update http_json.go and device_manager.go (mux.Vars → chi.URLParam)

These two files are the only places `mux.Vars` is called. Swapping them here unblocks removing the gorilla/mux import from the rest of the codebase.

**Files:**
- Modify: `controller/utils/http_json.go`
- Modify: `controller/device_manager/device_manager.go`

- [ ] **Step 1: Update http_json.go**

Replace the full file content of `controller/utils/http_json.go`:

```go
package utils

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type Doer interface {
	Do(func(interface{}))
}

func ErrorResponse(header int, msg string, w http.ResponseWriter) {
	log.Println("ERROR:", msg)
	resp := make(map[string]string)
	w.WriteHeader(header)
	resp["error"] = msg
	js, jsErr := json.Marshal(resp)
	if jsErr != nil {
		log.Println(jsErr)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}

func JSONResponse(payload interface{}, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(payload); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func JSONResponseWithStatus(httpStatus int, payload interface{}, w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(httpStatus)
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(payload); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to json decode. Error: "+err.Error(), w)
		return
	}
}

func JSONGetResponse(fn func(string) (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id := chi.URLParam(r, "id")
	payload, err := fn(id)
	if err != nil {
		ErrorResponse(http.StatusNotFound, err.Error(), w)
		log.Println("ERROR: GET", r.RequestURI, err)
		return
	}
	JSONResponse(payload, w, r)
}

func JSONListResponse(fn func() (interface{}, error), w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	payload, err := fn()
	if err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to list", w)
		log.Println("ERROR: GET", r.RequestURI, err)
		return
	}
	JSONResponse(payload, w, r)
}

func JSONCreateResponse(i interface{}, fn func() error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		ErrorResponse(http.StatusBadRequest, err.Error(), w)
		log.Println(i)
		return
	}
	if err := fn(); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to create. Error: "+err.Error(), w)
		return
	}
}

func JSONUpdateResponse(i interface{}, fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id := chi.URLParam(r, "id")
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(i); err != nil {
		ErrorResponse(http.StatusBadRequest, err.Error(), w)
		return
	}
	if err := fn(id); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to update. Error: "+err.Error(), w)
		return
	}
}

func JSONDeleteResponse(fn func(string) error, w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	id := chi.URLParam(r, "id")
	if err := fn(id); err != nil {
		ErrorResponse(http.StatusInternalServerError, "Failed to delete. Error: "+err.Error(), w)
		return
	}
}

func JSONGetUsage(usage Doer) http.HandlerFunc {
	handlerFn := func(w http.ResponseWriter, r *http.Request) {
		fn := func(id string) (interface{}, error) {
			arrayUsage := []interface{}{}
			usage.Do(func(i interface{}) {
				if i != nil {
					arrayUsage = append(arrayUsage, i)
				}
			})
			return arrayUsage, nil
		}
		JSONGetResponse(fn, w, r)
	}
	return handlerFn
}
```

- [ ] **Step 2: Update the one mux.Vars call in device_manager.go**

In `controller/device_manager/device_manager.go` around line 183, find:
```go
vars := mux.Vars(r)
```
Replace with:
```go
vars := map[string]string{"id": chi.URLParam(r, "id")}
```

Also update the import: remove `"github.com/gorilla/mux"`, add `"github.com/go-chi/chi/v5"`.

- [ ] **Step 3: Verify**

```bash
go build ./controller/utils/... ./controller/device_manager/...
```

Expected: exits 0.

---

### Task 7: Update all LoadAPI signatures — modules and subsystem infrastructure

Change every `LoadAPI(r *mux.Router)` to `LoadAPI(r chi.Router)` and update route registration syntax. Do all files in one commit.

**Files:** All 19 LoadAPI implementations listed in the File Map.

- [ ] **Step 1: Update controller/noop.go**

```go
// change import from gorilla/mux to chi/v5
// change signature
func (m *mockSubsystem) LoadAPI(r chi.Router) {}
```

- [ ] **Step 2: Update controller/subsystem_composite.go**

```go
import "github.com/go-chi/chi/v5"

func (s *SubsystemComposite) LoadAPI(router chi.Router) {
	for _, sController := range s.components {
		sController.LoadAPI(router)
	}
}
```

- [ ] **Step 3: Update controller/device_manager/device_manager.go LoadAPI**

```go
func (dm *DeviceManager) LoadAPI(r chi.Router) {
	dm.connectors.LoadAPI(r)
	dm.drivers.LoadAPI(r)
}
```

- [ ] **Step 4: Update controller/device_manager/drivers/api.go**

```go
func (d *Drivers) LoadAPI(r chi.Router) {
	r.Get("/api/drivers", d.list)
	r.Get("/api/drivers/options", d.listOptions)
	r.Get("/api/drivers/{id}", d.get)
	r.Put("/api/drivers", d.create)
	r.Delete("/api/drivers/{id}", d.delete)
	r.Post("/api/drivers/{id}", d.update)
	r.Post("/api/drivers/validate", d.validate)
}
```

- [ ] **Step 5: Update controller/device_manager/connectors/inlet.go**

```go
func (e *Inlets) LoadAPI(r chi.Router) {
	r.Get("/api/inlets/{id}", e.get)
	r.Get("/api/inlets", e.list)
	r.Put("/api/inlets", e.create)
	r.Delete("/api/inlets/{id}", e.delete)
	r.Post("/api/inlets/{id}", e.update)
	r.Post("/api/inlets/{id}/read", e.read)
}
```

- [ ] **Step 6: Update controller/device_manager/connectors/outlet.go**

```go
func (e *Outlets) LoadAPI(r chi.Router) {
	r.Get("/api/outlets/{id}", e.get)
	r.Get("/api/outlets", e.list)
	r.Put("/api/outlets", e.create)
	r.Delete("/api/outlets/{id}", e.delete)
	r.Post("/api/outlets/{id}", e.update)
}
```

- [ ] **Step 7: Update controller/device_manager/connectors/jack.go**

```go
func (c *Jacks) LoadAPI(r chi.Router) {
	r.Get("/api/jacks", c.list)
	r.Get("/api/jacks/{id}", c.get)
	r.Put("/api/jacks", c.create)
	r.Post("/api/jacks/{id}", c.update)
	r.Delete("/api/jacks/{id}", c.delete)
	r.Post("/api/jacks/{id}/control", c.control)
}
```

- [ ] **Step 8: Update controller/device_manager/connectors/analog_input.go**

```go
func (c *AnalogInputs) LoadAPI(r chi.Router) {
	r.Get("/api/analog_inputs", c.list)
	r.Get("/api/analog_inputs/{id}", c.get)
	r.Put("/api/analog_inputs", c.create)
	r.Post("/api/analog_inputs/{id}", c.update)
	r.Delete("/api/analog_inputs/{id}", c.delete)
	r.Post("/api/analog_inputs/{id}/read", c.read)
}
```

- [ ] **Step 9: Update controller/modules/ato/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/atos/{id}", c.get)
	r.Get("/api/atos", c.list)
	r.Put("/api/atos", c.create)
	r.Post("/api/atos/{id}", c.update)
	r.Delete("/api/atos/{id}", c.delete)
	r.Get("/api/atos/{id}/usage", c.getUsage)
	r.Post("/api/atos/{id}/reset", c.reset)
}
```

- [ ] **Step 10: Update controller/modules/camera/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/camera/config", c.get)
	r.Post("/api/camera/config", c.update)
	r.Post("/api/camera/shoot", c.shoot)
	r.Get("/api/camera/latest", c.latest)
	r.Get("/api/camera/list", c.list)
}
```

- [ ] **Step 11: Update controller/modules/doser/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/doser/pumps", c.list)
	r.Get("/api/doser/pumps/{id}", c.get)
	r.Put("/api/doser/pumps", c.create)
	r.Post("/api/doser/pumps/{id}", c.update)
	r.Delete("/api/doser/pumps/{id}", c.delete)
	r.Get("/api/doser/pumps/{id}/usage", c.getUsage)
	r.Post("/api/doser/pumps/{id}/calibrate", c.calibrate)
	r.Post("/api/doser/pumps/{id}/calibrate/save", c.calibrateSave)
	r.Post("/api/doser/pumps/{id}/schedule", c.schedule)
}
```

- [ ] **Step 12: Update controller/modules/equipment/api.go**

```go
func (e *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/equipment/{id}", e.GetEquipment)
	r.Get("/api/equipment", e.ListEquipment)
	r.Put("/api/equipment", e.CreateEquipment)
	r.Post("/api/equipment/{id}", e.UpdateEquipment)
	r.Delete("/api/equipment/{id}", e.DeleteEquipment)
	r.Post("/api/equipment/{id}/control", e.control)
}
```

Also remove the swagger comments above each route — they will be replaced by the spec.

- [ ] **Step 13: Update controller/modules/journal/api.go**

```go
func (s *Subsystem) LoadAPI(r chi.Router) {
	r.Get("/api/journal/{id}", s.get)
	r.Get("/api/journal", s.list)
	r.Put("/api/journal", s.create)
	r.Post("/api/journal/{id}", s.update)
	r.Delete("/api/journal/{id}", s.delete)
	r.Post("/api/journal/{id}/record", s.record)
	r.Get("/api/journal/{id}/usage", s.getUsage)
}
```

- [ ] **Step 14: Update controller/modules/lighting/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/lights", c.ListLights)
	r.Put("/api/lights", c.CreateLight)
	r.Get("/api/lights/{id}", c.GetLight)
	r.Post("/api/lights/{id}", c.UpdateLight)
	r.Delete("/api/lights/{id}", c.DeleteLight)
	r.Get("/api/lights/{id}/usage", c.getUsage)
}
```

- [ ] **Step 15: Update controller/modules/macro/api.go**

```go
func (t *Subsystem) LoadAPI(r chi.Router) {
	r.Get("/api/macros", t.list)
	r.Put("/api/macros", t.create)
	r.Get("/api/macros/{id}", t.get)
	r.Post("/api/macros/{id}", t.update)
	r.Delete("/api/macros/{id}", t.delete)
	r.Post("/api/macros/{id}/run", t.run)
	r.Post("/api/macros/{id}/revert", t.revert)
}
```

- [ ] **Step 16: Update controller/modules/ph/api.go**

```go
func (e *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/phprobes/{id}", e.getProbe)
	r.Get("/api/phprobes", e.listProbes)
	r.Put("/api/phprobes", e.createProbe)
	r.Post("/api/phprobes/{id}", e.updateProbe)
	r.Delete("/api/phprobes/{id}", e.deleteProbe)
	r.Get("/api/phprobes/{id}/readings", e.getReadings)
	r.Post("/api/phprobes/{id}/calibrate", e.calibrate)
	r.Get("/api/phprobes/{id}/read", e.read)
	r.Post("/api/phprobes/{id}/calibratepoint", e.calibratePoint)
}
```

- [ ] **Step 17: Update controller/modules/system/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Post("/api/display/on", c.EnableDisplay)
	r.Post("/api/display/off", c.DisableDisplay)
	r.Post("/api/display", c.SetBrightness)
	r.Get("/api/display", c.GetDisplayState)
	r.Post("/api/admin/poweroff", c.Poweroff)
	r.Post("/api/admin/reboot", c.Reboot)
	r.Post("/api/admin/reload", c.reload)
	r.Post("/api/admin/upgrade", c.upgrade)
	r.Get("/api/admin/reef-pi.db", c.dbExport)
	r.Post("/api/admin/reef-pi.db", c.dbImport)
	r.Get("/api/info", c.GetSummary)
	r.HandleFunc("/debug/pprof/", pprof.Index)
	r.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
	r.HandleFunc("/debug/pprof/profile", pprof.Profile)
	r.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
	r.HandleFunc("/debug/pprof/trace", pprof.Trace)
}
```

Note: `chi.Router` includes `HandleFunc` in its interface, so the pprof registrations work unchanged with a `chi.Router` parameter.

- [ ] **Step 18: Update controller/modules/temperature/api.go**

```go
func (t *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/tcs", t.list)
	r.Get("/api/tcs/sensors", t.sensors)
	r.Put("/api/tcs", t.create)
	r.Get("/api/tcs/{id}", t.get)
	r.Get("/api/tcs/{id}/current_reading", t.currentReading)
	r.Get("/api/tcs/{id}/read", t.read)
	r.Post("/api/tcs/{id}", t.update)
	r.Delete("/api/tcs/{id}", t.delete)
	r.Get("/api/tcs/{id}/usage", t.getUsage)
	r.Post("/api/tcs/{id}/calibrate", t.calibrate)
}
```

- [ ] **Step 19: Update controller/modules/timer/api.go**

```go
func (c *Controller) LoadAPI(r chi.Router) {
	r.Get("/api/timers/{id}", c.GetJob)
	r.Get("/api/timers", c.ListJobs)
	r.Put("/api/timers", c.CreateJob)
	r.Post("/api/timers/{id}", c.UpdateJob)
	r.Delete("/api/timers/{id}", c.DeleteJob)
}
```

- [ ] **Step 20: Update controller/telemetry/api.go**

Open `controller/telemetry/api.go` and find the `LoadAPI` method; update its signature and route syntax following the same pattern as steps above.

- [ ] **Step 21: Verify all LoadAPI implementations compile**

```bash
go build ./controller/...
```

Expected: errors only from `daemon/api.go` (not yet updated). No errors in any module.

---

### Task 8: Rewrite daemon/api.go to use chi

This is the main router assembly. The `Authenticate` method on the `Auth` interface takes `http.HandlerFunc` and returns `http.HandlerFunc` — wrap it as a chi middleware. Remove the inline `corsMiddleware` function (replaced by `chi/cors`).

**Files:**
- Modify: `controller/daemon/api.go`

- [ ] **Step 1: Rewrite serverHandler**

Replace the `serverHandler` function and the `corsMiddleware` function with:

```go
func (r *ReefPi) serverHandler() http.Handler {
	root := chi.NewRouter()

	root.Get("/", func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, "ui/home.html")
	})
	root.Get("/favicon.ico", func(w http.ResponseWriter, req *http.Request) {
		http.ServeFile(w, req, "ui/favicon.ico")
	})
	root.Handle("/assets/*", http.StripPrefix("/assets/", http.FileServer(http.Dir("ui/assets"))))
	root.Handle("/images/*", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	r.UnAuthenticatedAPI(root)

	root.Group(func(router chi.Router) {
		router.Use(func(next http.Handler) http.Handler {
			return r.a.Authenticate(next.ServeHTTP)
		})
		if r.settings.CORS {
			router.Use(cors.Handler(cors.Options{
				AllowedOrigins: []string{"*"},
				AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
				AllowedHeaders: []string{"*"},
			}))
		}
		r.AuthenticatedAPI(router)
	})

	if r.settings.Prometheus {
		r.prometheus(root)
	}

	return root
}
```

- [ ] **Step 2: Update method signatures that take *mux.Router**

In `daemon/api.go`, change all helper method signatures from `*mux.Router` to `chi.Router`:

```go
func (r *ReefPi) UnAuthenticatedAPI(router chi.Router) {
	router.Post("/auth/signin", r.a.SignIn)
	router.Get("/auth/signout", r.a.SignOut)
}

func (r *ReefPi) AuthenticatedAPI(router chi.Router) {
	r.registerCoreAPI(router)
	r.registerTelemetryAPI(router)
	r.registerErrorAPI(router)
	r.registerRuntimeAPI(router)
	r.dm.LoadAPI(router)
	r.subsystems.LoadAPI(router)
	r.registerDashboardAPI(router)
}

func (r *ReefPi) registerCoreAPI(router chi.Router) {
	router.Get("/api/capabilities", r.GetCapabilities)
	router.Get("/api/settings", r.GetSettings)
	router.Post("/api/settings", r.UpdateSettings)
	router.Post("/api/credentials", r.a.UpdateCredentials)
}

func (r *ReefPi) registerTelemetryAPI(router chi.Router) {
	router.Get("/api/telemetry", r.telemetry.GetConfig)
	router.Post("/api/telemetry", r.telemetry.UpdateConfig)
	router.Post("/api/telemetry/test_message", r.telemetry.SendTestMessage)
}

func (r *ReefPi) registerErrorAPI(router chi.Router) {
	router.Delete("/api/errors/clear", r.clearErrors)
	router.Delete("/api/errors/{id}", r.deleteError)
	router.Get("/api/errors/{id}", r.getError)
	router.Get("/api/errors", r.listErrors)
}

func (r *ReefPi) registerRuntimeAPI(router chi.Router) {
	router.Get("/api/me", r.a.Me)
	if r.settings.Capabilities.DevMode {
		router.Post("/api/dev/smoke/reset", r.ResetSmokeState)
	}
	if r.h != nil {
		router.Get("/api/health_stats", r.h.GetStats)
	}
}

func (r *ReefPi) registerDashboardAPI(router chi.Router) {
	if !r.settings.Capabilities.Dashboard {
		return
	}
	router.Get("/api/dashboard", r.GetDashboard)
	router.Post("/api/dashboard", r.UpdateDashboard)
}
```

- [ ] **Step 3: Update imports in daemon/api.go**

Remove `"github.com/gorilla/mux"`. Add:
```go
"github.com/go-chi/chi/v5"
"github.com/go-chi/cors"
```

Also remove the `utils.APIDoc(...)` wrapper from `registerCoreAPI` — it is incompatible with chi and will be deleted in Phase 3.

- [ ] **Step 4: Run go mod tidy to remove gorilla/mux**

```bash
go mod tidy
```

Expected: `github.com/gorilla/mux` line removed from `go.mod`. `github.com/gorilla/sessions` remains (used by auth).

- [ ] **Step 5: Build the full project**

```bash
go build ./...
```

Expected: exits 0.

- [ ] **Step 6: Run the full test suite**

```bash
make test
```

Expected: all tests pass. No handler logic was changed — only routing wiring.

- [ ] **Step 7: Commit Phase 1**

```bash
git add -u
git commit -m "[claude design] feat: replace gorilla/mux with chi router (mechanical swap)

- mux.Vars → chi.URLParam in http_json.go and device_manager.go
- All LoadAPI(*mux.Router) → LoadAPI(chi.Router)
- Route syntax: HandleFunc+Methods → r.Get/Post/Put/Delete
- daemon/api.go: chi.NewRouter, auth middleware adapter, chi/cors
- go mod tidy removes gorilla/mux"
```

---

## Phase 2: Equipment Module (Template)

> This section shows the complete cycle for the equipment module. Apply the same steps for every remaining module. Each module = one PR.
> Remaining module order: core, system, telemetry, timer, macro, journal, camera, ato, lighting, temperature, ph, doser, drivers, connectors.

### Task 9: Write the equipment schema

**Files:**
- Create: `openapi/schemas/equipment.yaml`

- [ ] **Step 1: Create the schema file**

Create `openapi/schemas/equipment.yaml`:
```yaml
Equipment:
  type: object
  required: [name, outlet]
  properties:
    id:
      type: string
      readOnly: true
    name:
      type: string
    outlet:
      type: string
    on:
      type: boolean
      readOnly: true
    stay_off_on_boot:
      type: boolean
    boot_delay:
      type: integer
      description: Seconds to wait after powering on during boot

EquipmentAction:
  type: object
  required: [on]
  properties:
    on:
      type: boolean
```

---

### Task 10: Write the equipment paths

**Files:**
- Create: `openapi/paths/equipment.yaml`

- [ ] **Step 1: Create the paths file**

Create `openapi/paths/equipment.yaml`:
```yaml
/api/equipment:
  get:
    operationId: listEquipment
    summary: List all equipment
    tags: [Equipment]
    responses:
      '200':
        description: List of equipment
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: '../schemas/equipment.yaml#/Equipment'
      '401':
        description: Unauthorized
        content:
          application/json:
            schema:
              $ref: '../openapi.yaml#/components/schemas/ErrorResponse'
  put:
    operationId: createEquipment
    summary: Create equipment
    tags: [Equipment]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '../schemas/equipment.yaml#/Equipment'
    responses:
      '200':
        description: Created successfully
      '400':
        description: Bad request
        content:
          application/json:
            schema:
              $ref: '../openapi.yaml#/components/schemas/ErrorResponse'
      '401':
        description: Unauthorized

/api/equipment/{id}:
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
  get:
    operationId: getEquipment
    summary: Get equipment by ID
    tags: [Equipment]
    responses:
      '200':
        description: Equipment
        content:
          application/json:
            schema:
              $ref: '../schemas/equipment.yaml#/Equipment'
      '401':
        description: Unauthorized
      '404':
        description: Not found
        content:
          application/json:
            schema:
              $ref: '../openapi.yaml#/components/schemas/ErrorResponse'
  post:
    operationId: updateEquipment
    summary: Update equipment
    tags: [Equipment]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '../schemas/equipment.yaml#/Equipment'
    responses:
      '200':
        description: Updated successfully
      '400':
        description: Bad request
      '401':
        description: Unauthorized
      '404':
        description: Not found
  delete:
    operationId: deleteEquipment
    summary: Delete equipment
    tags: [Equipment]
    responses:
      '200':
        description: Deleted successfully
      '401':
        description: Unauthorized
      '404':
        description: Not found

/api/equipment/{id}/control:
  parameters:
    - name: id
      in: path
      required: true
      schema:
        type: string
  post:
    operationId: controlEquipment
    summary: Turn equipment on or off
    tags: [Equipment]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '../schemas/equipment.yaml#/EquipmentAction'
    responses:
      '200':
        description: Control applied
      '400':
        description: Bad request
      '401':
        description: Unauthorized
      '404':
        description: Not found
```

---

### Task 11: Wire into root spec and regenerate

**Files:**
- Modify: `openapi/openapi.yaml`
- Modify: `controller/api/gen/api.gen.go` (generated)

- [ ] **Step 1: Add the equipment paths $ref to the root spec**

In `openapi/openapi.yaml`, change `paths: {}` to:
```yaml
paths:
  $ref: 'paths/equipment.yaml'
```

- [ ] **Step 2: Lint the spec**

```bash
npx @redocly/cli lint openapi/openapi.yaml
```

Expected: no errors.

- [ ] **Step 3: Regenerate**

```bash
go generate ./controller/api/...
```

Expected: `controller/api/gen/api.gen.go` is updated with `Equipment`, `EquipmentAction` types and a `StrictServerInterface` with 6 equipment methods.

- [ ] **Step 4: Verify the build fails on unimplemented interface**

```bash
go build ./... 2>&1 | grep "does not implement"
```

Expected: errors about `ReefPiServer` not implementing `StrictServerInterface` — these are the methods to add next.

---

### Task 12: Create ReefPiServer and implement equipment handlers

**Files:**
- Create: `controller/api/impl.go`
- Modify: `controller/modules/equipment/api.go`

- [ ] **Step 1: Create controller/api/impl.go**

```go
package api

import (
	"context"

	"github.com/reef-pi/reef-pi/controller/api/gen"
	"github.com/reef-pi/reef-pi/controller/modules/equipment"
)

// ReefPiServer implements gen.StrictServerInterface by delegating to module controllers.
// Constructed in daemon.ReefPi.API() alongside other module setup.
type ReefPiServer struct {
	equipment *equipment.Controller
}

func NewReefPiServer(eq *equipment.Controller) *ReefPiServer {
	return &ReefPiServer{equipment: eq}
}

func (s *ReefPiServer) ListEquipment(_ context.Context, _ gen.ListEquipmentRequestObject) (gen.ListEquipmentResponseObject, error) {
	items, err := s.equipment.List()
	if err != nil {
		return gen.ListEquipment500JSONResponse{Message: err.Error()}, nil
	}
	resp := make([]gen.Equipment, 0, len(items))
	for _, e := range items {
		resp = append(resp, equipmentToGen(e))
	}
	return gen.ListEquipment200JSONResponse(resp), nil
}

func (s *ReefPiServer) GetEquipment(_ context.Context, req gen.GetEquipmentRequestObject) (gen.GetEquipmentResponseObject, error) {
	e, err := s.equipment.Get(req.Id)
	if err != nil {
		return gen.GetEquipment404JSONResponse{Message: err.Error()}, nil
	}
	return gen.GetEquipment200JSONResponse(equipmentToGen(e)), nil
}

func (s *ReefPiServer) CreateEquipment(_ context.Context, req gen.CreateEquipmentRequestObject) (gen.CreateEquipmentResponseObject, error) {
	eq := equipment.Equipment{
		Name:          req.Body.Name,
		Outlet:        req.Body.Outlet,
		StayOffOnBoot: derefBool(req.Body.StayOffOnBoot),
		BootDelay:     derefInt(req.Body.BootDelay),
	}
	if err := s.equipment.Create(eq); err != nil {
		return gen.CreateEquipment400JSONResponse{Message: err.Error()}, nil
	}
	return gen.CreateEquipment200Response{}, nil
}

func (s *ReefPiServer) UpdateEquipment(_ context.Context, req gen.UpdateEquipmentRequestObject) (gen.UpdateEquipmentResponseObject, error) {
	eq := equipment.Equipment{
		Name:          req.Body.Name,
		Outlet:        req.Body.Outlet,
		StayOffOnBoot: derefBool(req.Body.StayOffOnBoot),
		BootDelay:     derefInt(req.Body.BootDelay),
	}
	if err := s.equipment.Update(req.Id, eq); err != nil {
		return gen.UpdateEquipment404JSONResponse{Message: err.Error()}, nil
	}
	return gen.UpdateEquipment200Response{}, nil
}

func (s *ReefPiServer) DeleteEquipment(_ context.Context, req gen.DeleteEquipmentRequestObject) (gen.DeleteEquipmentResponseObject, error) {
	if err := s.equipment.Delete(req.Id); err != nil {
		return gen.DeleteEquipment404JSONResponse{Message: err.Error()}, nil
	}
	return gen.DeleteEquipment200Response{}, nil
}

func (s *ReefPiServer) ControlEquipment(_ context.Context, req gen.ControlEquipmentRequestObject) (gen.ControlEquipmentResponseObject, error) {
	if err := s.equipment.Control(req.Id, req.Body.On); err != nil {
		return gen.ControlEquipment404JSONResponse{Message: err.Error()}, nil
	}
	return gen.ControlEquipment200Response{}, nil
}

// helpers

func equipmentToGen(e equipment.Equipment) gen.Equipment {
	return gen.Equipment{
		Id:            &e.ID,
		Name:          e.Name,
		Outlet:        e.Outlet,
		On:            &e.On,
		StayOffOnBoot: &e.StayOffOnBoot,
		BootDelay:     &e.BootDelay,
	}
}

func derefBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

func derefInt(i *int) int {
	if i == nil {
		return 0
	}
	return *i
}
```

Note: The exact generated type names (`gen.ListEquipment200JSONResponse`, `gen.GetEquipment404JSONResponse`, etc.) are produced by oapi-codegen from the `operationId` values in the spec. Verify them against the generated file and adjust if the naming pattern differs.

- [ ] **Step 2: Build to verify the interface is satisfied**

```bash
go build ./controller/api/...
```

Expected: exits 0. All 6 equipment methods are implemented.

- [ ] **Step 3: Remove LoadAPI from equipment/api.go**

The generated router wiring now owns route registration for the equipment module. Delete the `LoadAPI` method from `controller/modules/equipment/api.go`. Leave the handler functions (`GetEquipment`, `ListEquipment`, etc.) in place — they are still callable during transition. They will be removed after `impl.go` delegates to the module's business logic directly.

- [ ] **Step 4: Wire HandlerFromMux into daemon/api.go alongside remaining LoadAPI calls**

During Phase 2 the generated handler and legacy LoadAPI calls coexist — the generated handler owns migrated modules, LoadAPI owns the rest.

First, add a `server *api.ReefPiServer` field to `daemon.ReefPi` (in `controller/daemon/reefpi.go` or wherever the struct is defined) and construct it in the `API()` method:

```go
// In daemon/api.go API() method, before starting the server:
r.server = api.NewReefPiServer(r.equipmentCtrl)   // add module controllers as they migrate
```

Then update `AuthenticatedAPI` to call both the generated handler and remaining LoadAPI calls:

```go
func (r *ReefPi) AuthenticatedAPI(router chi.Router) {
    // Generated handler — owns all migrated module routes.
    // Add gen.HandlerFromMux on the FIRST Phase 2 PR; it grows automatically as modules migrate.
    gen.HandlerFromMux(gen.NewStrictHandler(r.server, nil), router)

    // Legacy LoadAPI — remove each line as its module is migrated to the generated handler.
    r.registerCoreAPI(router)
    r.registerTelemetryAPI(router)
    r.registerErrorAPI(router)
    r.registerRuntimeAPI(router)
    r.dm.LoadAPI(router)
    r.subsystems.LoadAPI(router)
    r.registerDashboardAPI(router)
}
```

After the equipment PR: remove `r.subsystems.LoadAPI` call for equipment (or remove equipment's LoadAPI so SubsystemComposite skips it). The generated handler registers `/api/equipment/*` routes; there must be no duplicate registration.

- [ ] **Step 5: Run the full test suite**

```bash
make test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add openapi/schemas/equipment.yaml openapi/paths/equipment.yaml openapi/openapi.yaml \
        controller/api/gen/api.gen.go controller/api/impl.go controller/modules/equipment/api.go
git commit -m "[claude design] feat: OA3 spec + codegen for equipment module

- openapi/paths/equipment.yaml: 6 operations with full request/response schemas
- openapi/schemas/equipment.yaml: Equipment and EquipmentAction schemas
- controller/api/impl.go: ReefPiServer with equipment delegation
- Removes LoadAPI from equipment module"
```

---

## Phase 2: Remaining Modules

Apply Tasks 9–12 for each module below. The spec content (paths YAML and schemas YAML) will differ per module, but the four-step cycle is identical: write schema → write paths → regenerate → implement interface method(s) in impl.go.

| Module | Paths file | Key schemas |
|---|---|---|
| core | `paths/core.yaml` | settings, capabilities, dashboard, error |
| auth | `paths/auth.yaml` | credentials |
| system | `paths/system.yaml` | displayState, displayConfig, systemSummary |
| telemetry | `paths/telemetry.yaml` | telemetryConfig |
| timer | `paths/timer.yaml` | timerJob |
| macro | `paths/macro.yaml` | macro, step |
| journal | `paths/journal.yaml` | journal entry |
| camera | `paths/camera.yaml` | cameraConfig |
| ato | `paths/ato.yaml` | ato |
| lighting | `paths/lighting.yaml` | light, channel |
| temperature | `paths/temperature.yaml` | temperatureController |
| ph | `paths/ph.yaml` | phProbe, calibrationPoint |
| doser | `paths/doser.yaml` | pump, doserSchedule, doserCalibrationDetails |
| drivers | `paths/drivers.yaml` | driver |
| connectors | `paths/connectors.yaml` | inlet, outlet, jack, analogInput |

For each, also add the module's controller field to `ReefPiServer` in `controller/api/impl.go` and add the delegation methods. As each module is migrated, its `LoadAPI` method is deleted.

---

## Phase 3: Remove Legacy Tooling (1 PR — after all Phase 2 modules complete)

### Task 13: Delete Swagger 2.0 artifacts and finalize

**Files:**
- Delete: `swagger.yml`, `swagger.json`, `openapi.yaml` (root-level skeleton)
- Delete: `controller/utils/doc.go`
- Modify: `Makefile`

- [ ] **Step 1: Delete legacy spec files**

```bash
rm swagger.yml swagger.json openapi.yaml
```

- [ ] **Step 2: Delete doc.go**

```bash
rm controller/utils/doc.go controller/utils/doc_test.go
```

- [ ] **Step 3: Remove go-swagger from go.mod**

```bash
go mod tidy
```

Expected: any `go-swagger` tool entry removed.

- [ ] **Step 4: Update Makefile**

Remove the `spec` target and `serve-spec` target. Add:
```makefile
.PHONY: spec
spec:
	go generate ./controller/api/...

.PHONY: lint-spec
lint-spec:
	npx @redocly/cli lint openapi/openapi.yaml

.PHONY: serve-spec
serve-spec:
	npx @redocly/cli preview-docs openapi/openapi.yaml -p 8888
```

Update `_dist_layout` to remove the `swagger.json` copy line. Add an `openapi.yaml` copy if the embedded spec is not serving it:
```makefile
# remove this line:
cp swagger.json dist/var/lib/reef-pi/ui/assets/swagger.json
```

Update `api-doc` target: replace `spec-url="/assets/swagger.json"` with `spec-url="/assets/openapi.yaml"` (or the runtime endpoint that serves the embedded spec).

- [ ] **Step 5: Add CI regeneration check to Makefile**

```makefile
.PHONY: check-spec
check-spec:
	go generate ./controller/api/...
	git diff --exit-code controller/api/gen/
```

Add `check-spec` to the `build` target prerequisites.

- [ ] **Step 6: Build and test**

```bash
make test
go build ./...
```

Expected: all green, no references to gorilla/mux or go-swagger.

- [ ] **Step 7: Commit**

```bash
git add -u
git commit -m "[claude design] feat: remove Swagger 2.0 tooling, finalize OA3 migration

- Delete swagger.yml, swagger.json, openapi.yaml (root skeleton)
- Delete controller/utils/doc.go (APIDoc/SummarizeAPI)
- Update Makefile: spec/lint-spec/serve-spec/check-spec targets
- OA3 coverage: 100% operations with request/response schemas"
```
