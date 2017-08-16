package utils

import (
	"net/http"
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
