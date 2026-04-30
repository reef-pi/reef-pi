package daemon

import (
	"fmt"
	"net/http"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

type smokeResetStore interface {
	DeleteBucket(string) error
	CreateBucket(string) error
	Update(string, string, interface{}) error
}

type smokeResetService struct {
	store   smokeResetStore
	buckets []string
}

var smokeResetBuckets = []string{
	storage.ATOBucket,
	storage.ATOUsageBucket,
	storage.AnalogInputBucket,
	storage.DoserBucket,
	storage.DoserUsageBucket,
	storage.DriverBucket,
	storage.EquipmentBucket,
	storage.ErrorBucket,
	storage.InletBucket,
	storage.JackBucket,
	storage.LightingBucket,
	storage.LightingUsageBucket,
	storage.MacroBucket,
	storage.MacroUsageBucket,
	storage.OutletBucket,
	storage.PhBucket,
	storage.PhCalibrationBucket,
	storage.PhReadingsBucket,
	storage.TemperatureBucket,
	storage.TemperatureCalibrationBucket,
	storage.TemperatureUsageBucket,
	storage.TimerBucket,
}

func newSmokeResetService(store smokeResetStore) smokeResetService {
	return smokeResetService{
		store:   store,
		buckets: smokeResetBuckets,
	}
}

func (s smokeResetService) Reset() error {
	for _, bucket := range s.buckets {
		if err := s.store.DeleteBucket(bucket); err != nil {
			return fmt.Errorf("Failed to reset smoke bucket. Error: %w", err)
		}
		if err := s.store.CreateBucket(bucket); err != nil {
			return fmt.Errorf("Failed to initialize smoke bucket. Error: %w", err)
		}
	}

	if err := s.store.Update(Bucket, "dashboard", DefaultDashboard); err != nil {
		return fmt.Errorf("Failed to reset dashboard. Error: %w", err)
	}

	return nil
}

func (r *ReefPi) ResetSmokeState(w http.ResponseWriter, req *http.Request) {
	if !r.settings.Capabilities.DevMode {
		utils.ErrorResponse(http.StatusNotFound, "dev smoke reset unavailable", w)
		return
	}

	if err := newSmokeResetService(r.store).Reset(); err != nil {
		utils.ErrorResponse(http.StatusInternalServerError, err.Error(), w)
		return
	}

	utils.JSONResponse(nil, w, req)
}
