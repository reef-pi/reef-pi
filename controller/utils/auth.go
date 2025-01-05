package utils

import (
    "encoding/json"
    "log"
    "net/http"

    "github.com/gorilla/sessions"

    "github.com/reef-pi/reef-pi/controller/storage"
)

type Auth interface {
    SignIn(http.ResponseWriter, *http.Request)
    SignOut(http.ResponseWriter, *http.Request)
    UpdateCredentials(http.ResponseWriter, *http.Request)
    Me(http.ResponseWriter, *http.Request)
    Authenticate(http.HandlerFunc) http.HandlerFunc
}

type auth struct {
    credentialsManager *CredentialsManager
    cookiejar          *sessions.CookieStore
}

func NewAuth(b string, store storage.Store) (Auth, error) {

    cookieStore := sessions.NewCookieStore([]byte("reef-pi-key"))
    cookieStore.Options.SameSite = http.SameSiteDefaultMode
    cookieStore.Options.Secure = false

    a := &auth{
        credentialsManager: NewCredentialsManager(store, b),
        cookiejar:          cookieStore,
    }

    _, err := a.getCredentials()
    if err != nil {
        log.Println("ERROR: Failed to load credentials. Error", err)
        log.Println("WARNING: Setting default credentials")
        if err := a.defaultCredentials(); err != nil {
            log.Println("ERROR: Failed to set default credentials. Error", err)
            return nil, err
        }
    }

    return a, nil
}

func (a *auth) Authenticate(fn http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, req *http.Request) {
        log.Printf("API Request:'%6s %s' from: %s\n", req.Method, req.URL.String(), req.RemoteAddr)
        authSession, err := a.cookiejar.Get(req, "auth")
        if err != nil {
            log.Println("unauthorized request.", req.RemoteAddr, "error:", err)
            http.Error(w, "Unauthorized.", 401)
            return
        }
        if user := authSession.Values["user"]; user == nil {
            log.Println("unauthorized request. user is not set.", req.RemoteAddr)
            http.Error(w, "Unauthorized.", 401)
            return
        }
        authSession.Save(req, w)
        fn(w, req)
    }
}

func (a *auth) Me(w http.ResponseWriter, req *http.Request) {
    JSONResponse("you?", w, req)
}

func (a *auth) SignIn(w http.ResponseWriter, req *http.Request) {
    var reqCredentials Credentials
    if req.Body == nil {
        http.Error(w, "No body request", 400)
        return
    }
    if err := json.NewDecoder(req.Body).Decode(&reqCredentials); err != nil {
        http.Error(w, err.Error(), 400)
        return
    }
    session, _ := a.cookiejar.Get(req, "auth")
    if session.Values["user"] == reqCredentials.User {
        log.Println("Already logged in.", req.RemoteAddr)
        JSONResponse(nil, w, req)
        return
    }

    validCredentials, err := a.credentialsManager.Validate(reqCredentials)
    if err != nil {
        log.Println("ERROR: Not able to fetch authentication creds. Error:", err)
        w.WriteHeader(500)
        JSONResponse(nil, w, req)
        return
    }
    if validCredentials {
        log.Println("Access granted for:", req.RemoteAddr)
        session.Values["user"] = reqCredentials.User
        session.Save(req, w)
        JSONResponse(nil, w, req)
        return
    }
    log.Println("DEBUG:", "Access Denied for", req.RemoteAddr)
    w.WriteHeader(401)
    JSONResponse(nil, w, req)
}

func (a *auth) SignOut(w http.ResponseWriter, req *http.Request) {
    session, _ := a.cookiejar.Get(req, "auth")
    defer session.Save(req, w)
    session.Options.MaxAge = -1
    log.Println("Sign out:", req.RemoteAddr)
}

func (a *auth) getCredentials() (Credentials, error) {
    return a.credentialsManager.Get()
}

func (a *auth) UpdateCredentials(w http.ResponseWriter, req *http.Request) {
    var credentials Credentials
    fn := func(_ string) error {
        return a.credentialsManager.Update(credentials)
    }
    JSONUpdateResponse(&credentials, fn, w, req)
}

func (a *auth) defaultCredentials() error {
    return a.credentialsManager.Update(Credentials{
        User:     "reef-pi",
        Password: "reef-pi",
    })
}
