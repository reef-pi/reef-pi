package utils

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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
	fn := func(id string) (interface{}, error) {
		return &payload, nil
	}
	JSONGetResponse(fn, resp, req)
	fn1 := func() (interface{}, error) {
		return &payload, nil
	}
	JSONListResponse(fn1, resp, req)
	fn2 := func() error { return nil }
	JSONCreateResponse(payload, fn2, resp, req)
	fn3 := func(_ string) error { return nil }
	JSONUpdateResponse(payload, fn3, resp, req)
	JSONDeleteResponse(fn3, resp, req)
}

func TestBasicAuth(t *testing.T) {
	a := NewBasicAuth("foo", "bar")
	if !a.check(a.user, a.pass) {
		t.Error("Basic auth against user password should pass")
	}
	fn := func(w http.ResponseWriter, r *http.Request) {}
	req, err := http.NewRequest("GET", "http://localhost:8080/api", nil)
	if err != nil {
		t.Fatal(err)
	}
	req.SetBasicAuth(a.user, a.pass)
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(a.BasicAuth(fn))
	handler.ServeHTTP(rr, req)
	if rr.Code != 200 {
		t.Error("Expected 200, Found:", rr.Code)
	}
}

type testDoer struct {
}

func (t *testDoer) Do(_ func(interface{})) {
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
