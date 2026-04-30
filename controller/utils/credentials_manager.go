package utils

import (
	"golang.org/x/crypto/bcrypt"

	"github.com/reef-pi/reef-pi/controller/storage"
)

//swagger:model credentials
type Credentials struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

type CredentialsManager struct {
	repo credentialsRepository
}

func NewCredentialsManager(store storage.Store, bucket string) *CredentialsManager {
	return &CredentialsManager{
		repo: newCredentialsRepository(store, bucket),
	}
}

func (cs *CredentialsManager) Get() (Credentials, error) {
	return cs.repo.Get()
}

func (cs *CredentialsManager) Update(credentials Credentials) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(credentials.Password), 14)
	if err != nil {
		return err
	}
	return cs.repo.Update(Credentials{
		User:     credentials.User,
		Password: string(hash),
	})
}

func (cs *CredentialsManager) Validate(credentials Credentials) (bool, error) {
	bucketCredentials, err := cs.Get()
	if err != nil {
		return false, err
	}
	return credentials.User == bucketCredentials.User &&
		(credentials.Password == bucketCredentials.Password ||
			bcrypt.CompareHashAndPassword([]byte(bucketCredentials.Password), []byte(credentials.Password)) == nil), nil

}
