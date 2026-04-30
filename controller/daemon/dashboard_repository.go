package daemon

import "github.com/reef-pi/reef-pi/controller/storage"

const dashboardKey = "dashboard"

type dashboardRepository struct {
	store storage.Store
}

func newDashboardRepository(store storage.Store) dashboardRepository {
	return dashboardRepository{
		store: store,
	}
}

func (r dashboardRepository) Setup() error {
	if err := r.store.CreateBucket(Bucket); err != nil {
		return err
	}
	return r.Update(DefaultDashboard)
}

func (r dashboardRepository) Get() (Dashboard, error) {
	var d Dashboard
	if err := r.store.Get(Bucket, dashboardKey, &d); err != nil {
		return d, err
	}
	return d, nil
}

func (r dashboardRepository) Update(d Dashboard) error {
	return r.store.Update(Bucket, dashboardKey, d)
}
