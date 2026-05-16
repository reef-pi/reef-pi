package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/reef-pi/reef-pi/controller/daemon"
	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

// setupTestDB creates a temp BoltDB file with an "atos" bucket and returns the
// path plus a cleanup func. The store is closed before returning so callers can
// reopen it (BoltDB allows only one opener at a time).
func setupTestDB(t *testing.T) (string, func()) {
	t.Helper()
	f, err := os.CreateTemp("", "reef-pi-test-*.db")
	if err != nil {
		t.Fatal("Failed to create temp db file:", err)
	}
	f.Close()

	store, err := storage.NewStore(f.Name())
	if err != nil {
		os.Remove(f.Name())
		t.Fatal("Failed to open test store:", err)
	}
	store.CreateBucket("atos")
	store.Close()

	return f.Name(), func() { os.Remove(f.Name()) }
}

// openStore opens a BoltDB store (already seeded by setupTestDB) and returns a
// dbCmd whose repository is set and a cleanup func.
func openCmd(t *testing.T, dbPath string, args []string) (*dbCmd, func()) {
	t.Helper()
	s, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatalf("openCmd: failed to open %s: %v", dbPath, err)
	}
	return &dbCmd{sPath: dbPath, args: args, repo: newDBRepository(s)}, func() { s.Close() }
}

type testDBRepository struct {
	rawGet []byte

	rawGetErr  error
	buckets    []string
	bucketsErr error
	list       map[string]json.RawMessage
	listErr    error
	createErr  error
	updateErr  error
	deleteErr  error
}

func (r testDBRepository) Close() error {
	return nil
}

func (r testDBRepository) RawGet(string, string) ([]byte, error) {
	return r.rawGet, r.rawGetErr
}

func (r testDBRepository) Buckets() ([]string, error) {
	return r.buckets, r.bucketsErr
}

func (r testDBRepository) List(string) (map[string]json.RawMessage, error) {
	return r.list, r.listErr
}

func (r testDBRepository) Create(string, []byte) error {
	return r.createErr
}

func (r testDBRepository) Update(string, string, []byte) error {
	return r.updateErr
}

func (r testDBRepository) Delete(string, string) error {
	return r.deleteErr
}

func TestNewDBCmd(t *testing.T) {
	cmd, err := NewDBCmd([]string{})
	if err != nil {
		t.Fatal("NewDBCmd should not error for empty args:", err)
	}
	if cmd == nil {
		t.Fatal("Expected non-nil dbCmd")
	}
	_ = cmd.Close()
}

func TestDBCmdExecute_MissingFile(t *testing.T) {
	cmd := &dbCmd{
		sPath: "/nonexistent/path/reef-pi.db",
		args:  []string{"list", "atos"},
	}
	if err := cmd.Execute(); err == nil {
		t.Error("Expected error for non-existent database file")
	}
}

func TestDBCmdExecute_OpenStoreError(t *testing.T) {
	cmd := &dbCmd{
		sPath: t.TempDir(),
		args:  []string{"list", "atos"},
	}
	err := cmd.Execute()
	if err == nil {
		t.Fatal("Expected error for database open failure")
	}
	if !strings.Contains(err.Error(), "failed to open database; check if reef-pi is already running") {
		t.Fatalf("unexpected error message: %v", err)
	}
	if errors.Unwrap(err) == nil {
		t.Fatalf("expected wrapped open error, got: %v", err)
	}
}

func TestDBCmdNoSubcommand(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	cmd, err := NewDBCmd([]string{"-store", dbPath})
	if err != nil {
		t.Fatal(err)
	}
	defer cmd.Close()
	if err := cmd.Execute(); err == nil {
		t.Error("Expected error with no sub-command")
	}
}

func TestDBCmdUnknownAction(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	cmd, err := NewDBCmd([]string{"-store", dbPath, "unknown_action"})
	if err != nil {
		t.Fatal(err)
	}
	defer cmd.Close()
	if err := cmd.Execute(); err == nil {
		t.Error("Expected error for unknown action")
	}
}

func TestDBCmdExecuteDispatch(t *testing.T) {
	for _, tc := range []struct {
		name string
		args []string
	}{
		{name: "buckets", args: []string{"buckets"}},
		{name: "list", args: []string{"list", "atos"}},
		{name: "show", args: []string{"show", "atos", "1"}},
		{name: "create", args: []string{"create", "atos"}},
		{name: "update", args: []string{"update", "atos", "1"}},
		{name: "delete", args: []string{"delete", "atos", "1"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			dbPath, cleanup := setupTestDB(t)
			defer cleanup()

			s, err := storage.NewStore(dbPath)
			if err != nil {
				t.Fatal(err)
			}
			if tc.name == "show" || tc.name == "update" || tc.name == "delete" {
				if err := s.Create("atos", func(id string) interface{} { return map[string]string{"name": "test"} }); err != nil {
					t.Fatal(err)
				}
			}
			s.Close()

			input := filepath.Join(t.TempDir(), "input.json")
			if err := os.WriteFile(input, []byte(`{"name":"updated"}`), 0644); err != nil {
				t.Fatal(err)
			}
			output := filepath.Join(t.TempDir(), "output.json")
			args := append([]string{"-store", dbPath, "-input", input, "-output", output}, tc.args...)
			cmd, err := NewDBCmd(args)
			if err != nil {
				t.Fatal(err)
			}
			defer cmd.Close()
			if err := cmd.Execute(); err != nil {
				t.Fatalf("Execute(%s) failed: %v", tc.name, err)
			}
		})
	}
}

func TestDBCmdBuckets(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	cmd, close := openCmd(t, dbPath, []string{"buckets"})
	defer close()
	if err := cmd.Buckets(); err != nil {
		t.Error("Buckets() failed:", err)
	}
}

func TestDBCmdList(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	// seed a record
	s, _ := storage.NewStore(dbPath)
	s.Create("atos", func(id string) interface{} { return map[string]string{"name": "test"} })
	s.Close()

	cmd, close := openCmd(t, dbPath, []string{"list", "atos"})
	defer close()
	if err := cmd.List(); err != nil {
		t.Error("List() failed:", err)
	}
}

func TestDBCmdShow(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	s, _ := storage.NewStore(dbPath)
	s.Create("atos", func(id string) interface{} { return map[string]string{"name": "test"} })
	s.Close()

	cmd, close := openCmd(t, dbPath, []string{"show", "atos", "1"})
	defer close()
	if err := cmd.Show(); err != nil {
		t.Error("Show() failed:", err)
	}
}

func TestDBCmdShowMissingID(t *testing.T) {
	cmd := &dbCmd{args: []string{"show", "testbucket"}}
	if err := cmd.Show(); err == nil {
		t.Error("Expected error for missing id")
	}
}

func TestDBCmdDeleteMissingID(t *testing.T) {
	cmd := &dbCmd{args: []string{"delete", "testbucket"}}
	err := cmd.Delete()
	if err == nil {
		t.Fatal("Expected error for missing id")
	}
	if err.Error() != "must provide id of the item to delete" {
		t.Fatalf("unexpected missing id error: %v", err)
	}
}

func TestDBCmdUpdateMissingID(t *testing.T) {
	cmd := &dbCmd{args: []string{"update", "testbucket"}}
	if err := cmd.Update(); err == nil {
		t.Error("Expected error for missing id")
	}
}

func TestDBCmdOutput_File(t *testing.T) {
	outFile := filepath.Join(t.TempDir(), "output.json")
	cmd := &dbCmd{output: outFile}
	data := []byte(`{"test": true}`)
	if err := cmd.Output(data); err != nil {
		t.Error("Output to file failed:", err)
	}
	got, err := os.ReadFile(outFile)
	if err != nil {
		t.Fatal("Failed to read output file:", err)
	}
	var m map[string]interface{}
	if err := json.Unmarshal(got, &m); err != nil {
		t.Error("Output file is not valid JSON:", err)
	}
}

func TestDBCmdOutput_Stdout(t *testing.T) {
	cmd := &dbCmd{output: ""}
	if err := cmd.Output([]byte("hello")); err != nil {
		t.Error("Output to stdout failed:", err)
	}
}

func TestDBCmdCreate(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	inFile := filepath.Join(t.TempDir(), "input.json")
	os.WriteFile(inFile, []byte(`{"name":"test"}`), 0644)

	cmd, close := openCmd(t, dbPath, []string{"create", "atos"})
	defer close()
	cmd.input = inFile
	if err := cmd.Create(); err != nil {
		t.Error("Create() failed:", err)
	}
}

func TestDBCmdDelete(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	s, _ := storage.NewStore(dbPath)
	s.Create("atos", func(id string) interface{} { return map[string]string{"name": "test"} })
	s.Close()

	cmd, close := openCmd(t, dbPath, []string{"delete", "atos", "1"})
	defer close()
	if err := cmd.Delete(); err != nil {
		t.Error("Delete() failed:", err)
	}
}

func TestDBCmdDeleteWrapsRepositoryError(t *testing.T) {
	wantErr := errors.New("delete failed")
	cmd := &dbCmd{
		args: []string{"delete", "atos", "1"},
		repo: testDBRepository{
			deleteErr: wantErr,
		},
	}
	err := cmd.Delete()
	if !errors.Is(err, wantErr) {
		t.Fatalf("expected wrapped delete error, got %v", err)
	}
	if !strings.Contains(err.Error(), "failed to delete item 1") {
		t.Fatalf("unexpected delete error message: %v", err)
	}
}

func TestDBCmdRepositoryErrors(t *testing.T) {
	tests := []struct {
		name    string
		cmd     *dbCmd
		run     func(*dbCmd) error
		wantMsg string
	}{
		{
			name:    "show",
			cmd:     &dbCmd{args: []string{"show", "atos", "1"}, repo: testDBRepository{rawGetErr: errors.New("raw get failed")}},
			run:     (*dbCmd).Show,
			wantMsg: "failed to get item 1",
		},
		{
			name:    "buckets",
			cmd:     &dbCmd{args: []string{"buckets"}, repo: testDBRepository{bucketsErr: errors.New("buckets failed")}},
			run:     (*dbCmd).Buckets,
			wantMsg: "failed to get list buckets",
		},
		{
			name:    "list",
			cmd:     &dbCmd{args: []string{"list", "atos"}, repo: testDBRepository{listErr: errors.New("list failed")}},
			run:     (*dbCmd).List,
			wantMsg: "failed to list items",
		},
		{
			name:    "create",
			cmd:     &dbCmd{args: []string{"create", "atos"}, input: filepath.Join(t.TempDir(), "create.json"), repo: testDBRepository{createErr: errors.New("create failed")}},
			run:     (*dbCmd).Create,
			wantMsg: "create failed",
		},
		{
			name:    "update",
			cmd:     &dbCmd{args: []string{"update", "atos", "1"}, input: filepath.Join(t.TempDir(), "update.json"), repo: testDBRepository{updateErr: errors.New("update failed")}},
			run:     (*dbCmd).Update,
			wantMsg: "update failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.cmd.input != "" {
				if err := os.WriteFile(tt.cmd.input, []byte(`{"name":"test"}`), 0644); err != nil {
					t.Fatal(err)
				}
			}
			err := tt.run(tt.cmd)
			if err == nil {
				t.Fatal("expected error")
			}
			if !strings.Contains(err.Error(), tt.wantMsg) {
				t.Fatalf("expected error containing %q, got %v", tt.wantMsg, err)
			}
		})
	}
}

func TestDBCmdUpdate(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	s, _ := storage.NewStore(dbPath)
	s.Create("atos", func(id string) interface{} { return map[string]string{"name": "orig"} })
	s.Close()

	inFile := filepath.Join(t.TempDir(), "update.json")
	os.WriteFile(inFile, []byte(`{"name":"updated"}`), 0644)

	cmd, close := openCmd(t, dbPath, []string{"update", "atos", "1"})
	defer close()
	cmd.input = inFile
	if err := cmd.Update(); err != nil {
		t.Error("Update() failed:", err)
	}
}

func TestDBCmdInputStdin(t *testing.T) {
	oldStdin := os.Stdin
	t.Cleanup(func() { os.Stdin = oldStdin })

	reader, writer, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	os.Stdin = reader
	if _, err := writer.Write([]byte(`{"name":"stdin"}`)); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}

	data, err := (&dbCmd{}).Input()
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != `{"name":"stdin"}` {
		t.Fatalf("unexpected stdin input: %s", string(data))
	}
}

func TestLoadConfig_Default(t *testing.T) {
	cfg, err := loadConfig("")
	if err != nil {
		t.Fatal("loadConfig failed:", err)
	}
	if cfg.Database == "" {
		t.Error("Expected non-empty default database path")
	}
}

func TestLoadConfig_File(t *testing.T) {
	cfg, err := loadConfig("../build/config.yaml")
	if err != nil {
		t.Fatal("loadConfig failed:", err)
	}
	if cfg.Database != "/var/lib/reef-pi/reef-pi.db" {
		t.Fatalf("unexpected database path: %s", cfg.Database)
	}
}

func TestLoadConfig_Error(t *testing.T) {
	if _, err := loadConfig("../build/missing-config.yaml"); err == nil {
		t.Fatal("expected loadConfig to fail for missing file")
	}
}

func TestMainVersion(t *testing.T) {
	if os.Getenv("REEF_PI_TEST_MAIN_VERSION") == "1" {
		Version = "v-test"
		os.Args = []string{"reef-pi", "-version"}
		main()
		return
	}
	cmd := exec.Command(os.Args[0], "-test.run=TestMainVersion")
	cmd.Env = append(os.Environ(), "REEF_PI_TEST_MAIN_VERSION=1")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("main -version failed: %v\n%s", err, string(out))
	}
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	if len(lines) == 0 || lines[0] != "v-test" {
		t.Fatalf("unexpected version output: %q", string(out))
	}
}

func TestMainUnknownCommand(t *testing.T) {
	if os.Getenv("REEF_PI_TEST_MAIN_UNKNOWN") == "1" {
		os.Args = []string{"reef-pi", "bogus"}
		main()
		return
	}
	cmd := exec.Command(os.Args[0], "-test.run=TestMainUnknownCommand")
	cmd.Env = append(os.Environ(), "REEF_PI_TEST_MAIN_UNKNOWN=1")
	out, err := cmd.CombinedOutput()
	if err == nil {
		t.Fatalf("expected main unknown command to exit non-zero, output: %s", string(out))
	}
	if !strings.Contains(string(out), "Unknown command") {
		t.Fatalf("expected unknown command output, got: %s", string(out))
	}
}

func TestResetPassword(t *testing.T) {
	dbPath, cleanup := setupTestDB(t)
	defer cleanup()

	s, err := storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.CreateBucket(daemon.Bucket); err != nil {
		t.Fatal(err)
	}
	s.Close()

	resetPassword(dbPath, "reef", "secret")

	s, err = storage.NewStore(dbPath)
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	ok, err := utils.NewCredentialsManager(s, daemon.Bucket).Validate(utils.Credentials{
		User:     "reef",
		Password: "secret",
	})
	if err != nil {
		t.Fatal(err)
	}
	if !ok {
		t.Fatal("expected updated credentials to validate")
	}
}

type fakeOutputCommand struct {
	out []byte
	err error
}

func (c fakeOutputCommand) CombinedOutput() ([]byte, error) {
	return c.out, c.err
}

func withCommandStubs(t *testing.T) {
	t.Helper()
	origCommandFn := commandFn
	origDownloadDebFn := downloadDebFn
	origHTTPGetFn := httpGetFn
	origSleepFn := sleepFn
	t.Cleanup(func() {
		commandFn = origCommandFn
		downloadDebFn = origDownloadDebFn
		httpGetFn = origHTTPGetFn
		sleepFn = origSleepFn
	})
	sleepFn = func(time.Duration) {}
}

func TestDownloadDeb(t *testing.T) {
	withCommandStubs(t)
	httpGetFn = func(rawURL string) (*http.Response, error) {
		u, err := url.Parse(rawURL)
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(rawURL, "/v1.2.3/reef-pi-v1.2.3-pi3.deb") {
			t.Fatalf("unexpected URL: %s", rawURL)
		}
		return &http.Response{
			Request: &http.Request{URL: u},
			Body:    io.NopCloser(strings.NewReader("deb payload")),
		}, nil
	}

	file, err := downloadDeb("3", "v1.2.3")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(file)
	data, err := os.ReadFile(file)
	if err != nil {
		t.Fatal(err)
	}
	if string(data) != "deb payload" {
		t.Fatalf("unexpected downloaded payload: %q", string(data))
	}
}

func TestInstall(t *testing.T) {
	withCommandStubs(t)

	var calls []string
	commandFn = func(bin string, args ...string) outputCommand {
		calls = append(calls, bin+" "+strings.Join(args, " "))
		if bin == "/bin/uname" {
			return fakeOutputCommand{out: []byte("armv6l")}
		}
		return fakeOutputCommand{}
	}
	downloadDebFn = func(pi, version string) (string, error) {
		if pi != "0" {
			t.Fatalf("expected pi zero package, got pi%s", pi)
		}
		if version != "v1.2.3" {
			t.Fatalf("unexpected version: %s", version)
		}
		return "/tmp/reef-pi.deb", nil
	}

	if err := install("v1.2.3"); err != nil {
		t.Fatal(err)
	}
	want := []string{
		"/bin/systemctl stop reef-pi.service",
		"/bin/uname -m",
		"/usr/bin/dpkg -i /tmp/reef-pi.deb",
		"/bin/systemctl start reef-pi.service",
	}
	if strings.Join(calls, "\n") != strings.Join(want, "\n") {
		t.Fatalf("unexpected command calls:\n%s", strings.Join(calls, "\n"))
	}
}

func TestInstallReturnsUnameError(t *testing.T) {
	withCommandStubs(t)
	wantErr := errors.New("uname failed")
	commandFn = func(bin string, args ...string) outputCommand {
		if bin == "/bin/uname" {
			return fakeOutputCommand{err: wantErr}
		}
		return fakeOutputCommand{}
	}
	if err := install("v1.2.3"); !errors.Is(err, wantErr) {
		t.Fatalf("expected uname error, got %v", err)
	}
}

func TestInstallReturnsDownloadError(t *testing.T) {
	withCommandStubs(t)
	wantErr := errors.New("download failed")
	commandFn = func(bin string, args ...string) outputCommand {
		if bin == "/bin/uname" {
			return fakeOutputCommand{out: []byte("armv7l")}
		}
		return fakeOutputCommand{}
	}
	downloadDebFn = func(pi, version string) (string, error) {
		return "", wantErr
	}
	if err := install("v1.2.3"); !errors.Is(err, wantErr) {
		t.Fatalf("expected download error, got %v", err)
	}
}

func TestRestoreDb(t *testing.T) {
	withCommandStubs(t)

	var calls []string
	commandFn = func(bin string, args ...string) outputCommand {
		calls = append(calls, bin+" "+strings.Join(args, " "))
		return fakeOutputCommand{}
	}
	dir := t.TempDir()
	current := filepath.Join(dir, "reef-pi.db")
	backup := filepath.Join(dir, "reef-pi.db.old")
	next := filepath.Join(dir, "reef-pi.db.new")
	if err := os.WriteFile(current, []byte("current"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(next, []byte("next"), 0644); err != nil {
		t.Fatal(err)
	}

	restoreDb(current, backup, next)

	currentData, err := os.ReadFile(current)
	if err != nil {
		t.Fatal(err)
	}
	backupData, err := os.ReadFile(backup)
	if err != nil {
		t.Fatal(err)
	}
	if string(currentData) != "next" || string(backupData) != "current" {
		t.Fatalf("unexpected restore result: current=%q backup=%q", string(currentData), string(backupData))
	}
	want := []string{
		"/bin/systemctl stop reef-pi.service",
		"/bin/systemctl start reef-pi.service",
	}
	if strings.Join(calls, "\n") != strings.Join(want, "\n") {
		t.Fatalf("unexpected command calls:\n%s", strings.Join(calls, "\n"))
	}
}

func TestRestoreDbReturnsAfterStopError(t *testing.T) {
	withCommandStubs(t)
	commandFn = func(bin string, args ...string) outputCommand {
		return fakeOutputCommand{err: errors.New("stop failed")}
	}
	dir := t.TempDir()
	current := filepath.Join(dir, "reef-pi.db")
	backup := filepath.Join(dir, "reef-pi.db.old")
	next := filepath.Join(dir, "reef-pi.db.new")
	if err := os.WriteFile(current, []byte("current"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(next, []byte("next"), 0644); err != nil {
		t.Fatal(err)
	}

	restoreDb(current, backup, next)

	currentData, err := os.ReadFile(current)
	if err != nil {
		t.Fatal(err)
	}
	if string(currentData) != "current" {
		t.Fatalf("expected current db to remain untouched, got %q", string(currentData))
	}
	if _, err := os.Stat(backup); !os.IsNotExist(err) {
		t.Fatalf("expected no backup file, stat err=%v", err)
	}
}
