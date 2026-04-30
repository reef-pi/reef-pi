package utils

import "github.com/reef-pi/reef-pi/controller/storage"

const credentialsKey = "credentials"

type credentialsRepository interface {
	Get() (Credentials, error)
	Update(Credentials) error
}

type storeCredentialsRepository struct {
	store  storage.Store
	bucket string
}

func newCredentialsRepository(store storage.Store, bucket string) credentialsRepository {
	return storeCredentialsRepository{
		store:  store,
		bucket: bucket,
	}
}

func (r storeCredentialsRepository) Get() (Credentials, error) {
	var c Credentials
	return c, r.store.Get(r.bucket, credentialsKey, &c)
}

func (r storeCredentialsRepository) Update(c Credentials) error {
	return r.store.Update(r.bucket, credentialsKey, c)
}
