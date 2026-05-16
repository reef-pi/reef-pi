package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

type mockResponseWriter struct {
	header http.Header
}

func (m mockResponseWriter) Header() http.Header {
	return m.header
}
func (m mockResponseWriter) Write(bs []byte) (int, error) {
	return len(bs), nil
}
func (m mockResponseWriter) WriteHeader(i int) {}

func TestErrorResponse(t *testing.T) {
	rw := mockResponseWriter{
		header: make(map[string][]string),
	}
	ErrorResponse(425, "throttle", rw)
	if rw.Header().Get("Content-Type") != "application/json" {
		t.Fatal("Wrong content type header.", rw.Header().Get("Content-Type"))
	}
}

func assertJSONError(t *testing.T, rr *httptest.ResponseRecorder, status int, message string) {
	t.Helper()
	if rr.Code != status {
		t.Fatalf("expected status %d, got %d", status, rr.Code)
	}
	var payload map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected JSON error response, got %q: %v", rr.Body.String(), err)
	}
	if payload["error"] != message {
		t.Fatalf("expected error %q, got %q", message, payload["error"])
	}
}

func TestErrorResponseWritesStatusAndJSONBody(t *testing.T) {
	rr := httptest.NewRecorder()
	ErrorResponse(425, "throttle", rr)

	assertJSONError(t, rr, 425, "throttle")
}

func TestJSONResponses(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/doesnotexist", strings.NewReader("{}"))
	if err != nil {
		t.Fatal("Failed to create http request. Error:", err)
	}
	resp := mockResponseWriter{
		header: make(map[string][]string),
	}
	var payload map[string]string
	JSONResponse(payload, resp, req)
	JSONGetResponse(func(_ string) (interface{}, error) { return nil, nil }, resp, req)
	JSONGetResponse(func(_ string) (interface{}, error) { return nil, fmt.Errorf("test error") }, resp, req)
	JSONListResponse(func() (interface{}, error) { return nil, fmt.Errorf("test error") }, resp, req)
	JSONListResponse(func() (interface{}, error) { return nil, nil }, resp, req)
	body := new(bytes.Buffer)
	body.Write([]byte(`{"foo":"bar"}`))
	req.Body = ioutil.NopCloser(body)
	JSONCreateResponse(&payload, func() error { return fmt.Errorf("") }, resp, req)
	JSONCreateResponse(payload, func() error { return fmt.Errorf("") }, resp, req)
	body.Write([]byte(`{"foo":"bar"}`))
	req.Body = ioutil.NopCloser(body)
	JSONUpdateResponse(&payload, func(_ string) error { return fmt.Errorf("") }, resp, req)
	JSONUpdateResponse(payload, func(_ string) error { return nil }, resp, req)
	JSONDeleteResponse(func(_ string) error { return fmt.Errorf("") }, resp, req)
}

func TestJSONResponseWithStatus(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/test", strings.NewReader("{}"))
	if err != nil {
		t.Fatal("Failed to create http request. Error:", err)
	}
	rr := httptest.NewRecorder()
	payload := map[string]string{"key": "value"}
	JSONResponseWithStatus(http.StatusCreated, payload, rr, req)
	if rr.Code != http.StatusCreated {
		t.Errorf("Expected status %d, got %d", http.StatusCreated, rr.Code)
	}
}

func TestJSONGetResponseWritesPayloadAndNotFound(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/test/7", strings.NewReader("{}"))
	req = mux.SetURLVars(req, map[string]string{"id": "7"})
	rr := httptest.NewRecorder()

	JSONGetResponse(func(id string) (interface{}, error) {
		if id != "7" {
			t.Fatalf("expected id 7, got %q", id)
		}
		return map[string]string{"id": id}, nil
	}, rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
	if strings.TrimSpace(rr.Body.String()) != `{"id":"7"}` {
		t.Fatalf("unexpected body: %q", rr.Body.String())
	}

	req = httptest.NewRequest("GET", "/api/test/8", strings.NewReader("{}"))
	req = mux.SetURLVars(req, map[string]string{"id": "8"})
	rr = httptest.NewRecorder()
	JSONGetResponse(func(string) (interface{}, error) {
		return nil, fmt.Errorf("missing")
	}, rr, req)

	assertJSONError(t, rr, http.StatusNotFound, "missing")
}

func TestJSONListResponseWritesPayloadAndErrors(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/test", strings.NewReader("{}"))
	rr := httptest.NewRecorder()

	JSONListResponse(func() (interface{}, error) {
		return []string{"a", "b"}, nil
	}, rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
	if strings.TrimSpace(rr.Body.String()) != `["a","b"]` {
		t.Fatalf("unexpected body: %q", rr.Body.String())
	}

	req = httptest.NewRequest("GET", "/api/test", strings.NewReader("{}"))
	rr = httptest.NewRecorder()
	JSONListResponse(func() (interface{}, error) {
		return nil, fmt.Errorf("boom")
	}, rr, req)

	assertJSONError(t, rr, http.StatusInternalServerError, "Failed to list")
}

func TestJSONCreateUpdateDeleteResponseStatusPaths(t *testing.T) {
	t.Run("create decodes payload and returns ok", func(t *testing.T) {
		var payload map[string]string
		req := httptest.NewRequest("PUT", "/api/test", strings.NewReader(`{"name":"reef-pi"}`))
		rr := httptest.NewRecorder()
		called := false

		JSONCreateResponse(&payload, func() error {
			called = true
			return nil
		}, rr, req)

		if !called {
			t.Fatal("expected create callback to run")
		}
		if payload["name"] != "reef-pi" {
			t.Fatalf("unexpected decoded payload: %#v", payload)
		}
		if rr.Code != http.StatusOK {
			t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
		}
	})

	t.Run("create reports invalid json", func(t *testing.T) {
		var payload map[string]string
		req := httptest.NewRequest("PUT", "/api/test", strings.NewReader(`{`))
		rr := httptest.NewRecorder()

		JSONCreateResponse(&payload, func() error {
			t.Fatal("create callback should not run")
			return nil
		}, rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
		}
	})

	t.Run("update passes route id", func(t *testing.T) {
		var payload map[string]string
		req := httptest.NewRequest("POST", "/api/test/9", strings.NewReader(`{"name":"updated"}`))
		req = mux.SetURLVars(req, map[string]string{"id": "9"})
		rr := httptest.NewRecorder()

		JSONUpdateResponse(&payload, func(id string) error {
			if id != "9" {
				t.Fatalf("expected id 9, got %q", id)
			}
			return nil
		}, rr, req)

		if payload["name"] != "updated" {
			t.Fatalf("unexpected decoded payload: %#v", payload)
		}
		if rr.Code != http.StatusOK {
			t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
		}
	})

	t.Run("delete reports callback errors", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/test/10", strings.NewReader("{}"))
		req = mux.SetURLVars(req, map[string]string{"id": "10"})
		rr := httptest.NewRecorder()

		JSONDeleteResponse(func(id string) error {
			if id != "10" {
				t.Fatalf("expected id 10, got %q", id)
			}
			return fmt.Errorf("delete failed")
		}, rr, req)

		assertJSONError(t, rr, http.StatusInternalServerError, "Failed to delete. Error: delete failed")
	})
}

func TestJSONCreateResponseCallbackErrorWritesStatusAndBody(t *testing.T) {
	var payload map[string]string
	req := httptest.NewRequest("PUT", "/api/test", strings.NewReader(`{"name":"reef-pi"}`))
	rr := httptest.NewRecorder()

	JSONCreateResponse(&payload, func() error {
		return fmt.Errorf("create failed")
	}, rr, req)

	assertJSONError(t, rr, http.StatusInternalServerError, "Failed to create. Error: create failed")
}

func TestJSONUpdateResponseInvalidJSONAndCallbackError(t *testing.T) {
	t.Run("invalid json", func(t *testing.T) {
		var payload map[string]string
		req := httptest.NewRequest("POST", "/api/test/11", strings.NewReader(`{`))
		req = mux.SetURLVars(req, map[string]string{"id": "11"})
		rr := httptest.NewRecorder()

		JSONUpdateResponse(&payload, func(string) error {
			t.Fatal("update callback should not run")
			return nil
		}, rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Fatalf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
		}
		var errPayload map[string]string
		if err := json.Unmarshal(rr.Body.Bytes(), &errPayload); err != nil {
			t.Fatalf("expected JSON error response, got %q: %v", rr.Body.String(), err)
		}
		if errPayload["error"] == "" {
			t.Fatalf("expected non-empty JSON decode error, got %#v", errPayload)
		}
	})

	t.Run("callback error", func(t *testing.T) {
		var payload map[string]string
		req := httptest.NewRequest("POST", "/api/test/12", strings.NewReader(`{"name":"updated"}`))
		req = mux.SetURLVars(req, map[string]string{"id": "12"})
		rr := httptest.NewRecorder()

		JSONUpdateResponse(&payload, func(id string) error {
			if id != "12" {
				t.Fatalf("expected id 12, got %q", id)
			}
			return fmt.Errorf("update failed")
		}, rr, req)

		assertJSONError(t, rr, http.StatusInternalServerError, "Failed to update. Error: update failed")
	})
}

func TestJSONDeleteResponseSuccessPassesRouteID(t *testing.T) {
	req := httptest.NewRequest("DELETE", "/api/test/13", strings.NewReader("{}"))
	req = mux.SetURLVars(req, map[string]string{"id": "13"})
	rr := httptest.NewRecorder()
	called := false

	JSONDeleteResponse(func(id string) error {
		called = true
		if id != "13" {
			t.Fatalf("expected id 13, got %q", id)
		}
		return nil
	}, rr, req)

	if !called {
		t.Fatal("expected delete callback to run")
	}
	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
	if rr.Body.Len() != 0 {
		t.Fatalf("expected empty response body, got %q", rr.Body.String())
	}
}

type testDoer struct{}

func (t *testDoer) Do(_ func(interface{})) {}

type usageDoer []interface{}

func (u usageDoer) Do(fn func(interface{})) {
	for _, item := range u {
		fn(item)
	}
}

func Test_JSONGetUsage(t *testing.T) {
	d := &testDoer{}
	fn := JSONGetUsage(d)
	req, err := http.NewRequest("GET", "http://localhost:8080/api", new(bytes.Buffer))
	if err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(fn)
	handler.ServeHTTP(rr, req)
}

func TestJSONResponseEncoderErrorWritesInternalServerError(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/test", strings.NewReader("{}"))
	rr := httptest.NewRecorder()

	JSONResponse(make(chan int), rr, req)

	assertJSONError(t, rr, http.StatusInternalServerError, "Failed to json decode. Error: json: unsupported type: chan int")
}

func TestJSONResponseWithStatusEncoderErrorKeepsInitialStatus(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/test", strings.NewReader("{}"))
	rr := httptest.NewRecorder()

	JSONResponseWithStatus(http.StatusAccepted, make(chan int), rr, req)

	if rr.Code != http.StatusAccepted {
		t.Fatalf("expected initial status %d, got %d", http.StatusAccepted, rr.Code)
	}
	var payload map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected JSON error response, got %q: %v", rr.Body.String(), err)
	}
	if payload["error"] != "Failed to json decode. Error: json: unsupported type: chan int" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
}

func TestJSONGetUsageFiltersNilItems(t *testing.T) {
	fn := JSONGetUsage(usageDoer{
		map[string]string{"name": "temperature"},
		nil,
		map[string]string{"name": "heater"},
	})
	req := httptest.NewRequest("GET", "/api/usage", strings.NewReader("{}"))
	rr := httptest.NewRecorder()

	http.HandlerFunc(fn).ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
	var payload []map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected usage JSON array, got %q: %v", rr.Body.String(), err)
	}
	if len(payload) != 2 {
		t.Fatalf("expected nil usage items to be filtered, got %#v", payload)
	}
	if payload[0]["name"] != "temperature" || payload[1]["name"] != "heater" {
		t.Fatalf("unexpected usage payload: %#v", payload)
	}
}
