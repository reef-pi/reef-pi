package utils

import (
	"github.com/reef-pi/reef-pi/controller/storage"
	"golang.org/x/crypto/bcrypt"
)

//swagger:model credentials
type Credentials struct {
	User     string `json:"user"`
	Password string `json:"password"`
}

type CredentialsManager struct {
	store  storage.Store
	bucket string
}

func NewCredentialsManager(store storage.Store, bucket string) *CredentialsManager {
	return &CredentialsManager{
		store:  store,
		bucket: bucket,
	}
}

func (cs *CredentialsManager) Get() (Credentials, error) {
	var c Credentials
	return c, cs.store.Get(cs.bucket, "credentials", &c)
}

func (cs *CredentialsManager) Update(credentials Credentials) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(credentials.Password), 14)
	if err != nil {
		return err
	}
	return cs.store.Update(cs.bucket, "credentials", Credentials{
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
