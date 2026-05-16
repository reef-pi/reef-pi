package system

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/reef-pi/reef-pi/controller"
)

func TestGetDisplayStateReturnsEmptyWhenDisplayDisabled(t *testing.T) {
	c := &Controller{
		config: Config{Display: false},
	}

	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/display", strings.NewReader("{}"))
	c.GetDisplayState(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rr.Code, rr.Body.String())
	}
	var state DisplayState
	if err := json.Unmarshal(rr.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if state.On || state.Brightness != 0 {
		t.Fatalf("expected empty display state when display is disabled, got %+v", state)
	}
}

func TestDBExportServesControllerStore(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	c := &Controller{c: con}
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/admin/reef-pi.db", nil)

	c.dbExport(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}
	if rr.Body.Len() == 0 {
		t.Fatal("expected exported database response body")
	}
}

func TestDBImportReturnsWhenFormFileIsMissing(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	c := &Controller{c: con}
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/admin/reef-pi.db", strings.NewReader("not multipart"))

	c.dbImport(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected missing upload to leave default status 200, got %d", rr.Code)
	}
}

func TestDBImportWritesUploadedDatabaseBeforeRestore(t *testing.T) {
	con, err := controller.TestController()
	if err != nil {
		t.Fatal(err)
	}
	defer con.Store().Close()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	fileWriter, err := writer.CreateFormFile("dbImport", "reef-pi.db")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fileWriter.Write([]byte("replacement db")); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}

	c := &Controller{c: con}
	rr := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/admin/reef-pi.db", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	c.dbImport(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}
	data, err := os.ReadFile(con.Store().Path() + ".new")
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "replacement db" {
		t.Fatalf("expected uploaded db contents, got %q", string(data))
	}
}
