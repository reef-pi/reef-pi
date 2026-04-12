package timer

import (
	"encoding/json"

	"github.com/reef-pi/reef-pi/controller/storage"
)

type repository interface {
	Setup() error
	Get(string) (Job, error)
	List() ([]Job, error)
	Create(Job) (Job, error)
	Update(string, Job) error
	Delete(string) error
}

type storeRepository struct {
	store storage.Store
}

func newRepository(store storage.Store) repository {
	return storeRepository{store: store}
}

func (r storeRepository) Setup() error {
	return r.store.CreateBucket(Bucket)
}

func (r storeRepository) Get(id string) (Job, error) {
	var job Job
	return job, r.store.Get(Bucket, id, &job)
}

func (r storeRepository) List() ([]Job, error) {
	jobs := []Job{}
	err := r.store.List(Bucket, func(_ string, v []byte) error {
		var job Job
		if err := json.Unmarshal(v, &job); err != nil {
			return err
		}
		jobs = append(jobs, job)
		return nil
	})
	return jobs, err
}

func (r storeRepository) Create(job Job) (Job, error) {
	created := job
	err := r.store.Create(Bucket, func(id string) interface{} {
		created.ID = id
		return created
	})
	return created, err
}

func (r storeRepository) Update(id string, job Job) error {
	return r.store.Update(Bucket, id, &job)
}

func (r storeRepository) Delete(id string) error {
	return r.store.Delete(Bucket, id)
}
