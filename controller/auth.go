package controller

import (
	"golang.org/x/crypto/bcrypt"
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

func (r *ReefPi

func main() {
	password := "secret"
	hash, _ := HashPassword(password) // ignore error for the sake of simplicity

	fmt.Println("Password:", password)
	fmt.Println("Hash:    ", hash)

	match := CheckPasswordHash(password, hash)
	fmt.Println("Match:   ", match)
}
