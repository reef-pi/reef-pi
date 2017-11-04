package utils

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
)

func TestDB() (Store, error) {
	wd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	db := filepath.Join(wd, "test.db")
	if _, err := os.Stat(db); !os.IsNotExist(err) {
		os.Remove(db)
	}
	return NewStore(db)
}

type TestRouter struct {
	Router *mux.Router
}

func NewTestRouter() *TestRouter {
	return &TestRouter{
		Router: mux.NewRouter(),
	}
}

func (t *TestRouter) Do(method, path string, body io.Reader, container interface{}) error {
	req, err := http.NewRequest(method, path, body)
	if err != nil {
		return err
	}
	rr := httptest.NewRecorder()
	t.Router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		return fmt.Errorf("HTTP Code %d. Response:%s", rr.Code, rr.Body.String())
	}
	if container == nil {
		return nil
	}
	fmt.Println(rr.Body.String())
	return json.Unmarshal([]byte(rr.Body.String()), container)

}

func TestTelemetry() *Telemetry {
	aio := AdafruitIO{
		User: "test-user",
	}
	return NewTelemetry(aio, &NoopMailer{})
}
