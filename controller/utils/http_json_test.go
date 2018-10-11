package utils

import (
	"bytes"
	"fmt"
	"io/ioutil"
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

type testDoer struct{}

func (t *testDoer) Do(_ func(interface{})) {}

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
