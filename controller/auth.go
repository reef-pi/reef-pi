package controller

import (
	"fmt"
	"github.com/reef-pi/reef-pi/controller/utils"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

type Credentials struct {
	User     string `json:"user"`
	Password string `json:"user"`
}

func (r *ReefPi) CheckCreds(user, password string) error {
	var c Credentials
	if err := r.store.Get(Bucket, "credentials", &c); err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		return err
	}
	return bcrypt.CompareHashAndPassword(hash, []byte(password))
}

func (r *ReefPi) UpdateAuth(w http.ResponseWriter, req *http.Request) {
	fn := func(_ string) (interface{}, error) {
		return r.Capabilities(), nil
	}
	utils.JSONGetResponse(fn, w, req)
}

func main() {
	password := "secret"
	hash, _ := HashPassword(password) // ignore error for the sake of simplicity

	fmt.Println("Password:", password)
	fmt.Println("Hash:    ", hash)

	match := CheckPasswordHash(password, hash)
	fmt.Println("Match:   ", match)
}
