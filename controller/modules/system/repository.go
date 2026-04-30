package system

import "github.com/reef-pi/reef-pi/controller/storage"

const (
	startTimeID = "start_time"
	stopTimeID  = "stop_time"
)

type repository interface {
	Setup() error
	LogStartTime(TimeLog) error
	LogStopTime(TimeLog) error
	LastStartTime() (TimeLog, error)
	LastStopTime() (TimeLog, error)
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

func (r storeRepository) LogStartTime(l TimeLog) error {
	return r.store.CreateWithID(Bucket, startTimeID, &l)
}

func (r storeRepository) LogStopTime(l TimeLog) error {
	return r.store.CreateWithID(Bucket, stopTimeID, &l)
}

func (r storeRepository) LastStartTime() (TimeLog, error) {
	var l TimeLog
	return l, r.store.Get(Bucket, startTimeID, &l)
}

func (r storeRepository) LastStopTime() (TimeLog, error) {
	var l TimeLog
	return l, r.store.Get(Bucket, stopTimeID, &l)
}
