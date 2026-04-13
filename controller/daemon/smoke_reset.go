package daemon

import (
	"net/http"

	"github.com/reef-pi/reef-pi/controller/storage"
	"github.com/reef-pi/reef-pi/controller/utils"
)

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

func (r *ReefPi) ResetSmokeState(w http.ResponseWriter, req *http.Request) {
	if !r.settings.Capabilities.DevMode {
		utils.ErrorResponse(http.StatusNotFound, "dev smoke reset unavailable", w)
		return
	}

	for _, bucket := range smokeResetBuckets {
		if err := r.store.DeleteBucket(bucket); err != nil {
			utils.ErrorResponse(http.StatusInternalServerError, "Failed to reset smoke bucket. Error: "+err.Error(), w)
			return
		}
		if err := r.store.CreateBucket(bucket); err != nil {
			utils.ErrorResponse(http.StatusInternalServerError, "Failed to initialize smoke bucket. Error: "+err.Error(), w)
			return
		}
	}

	if err := r.store.Update(Bucket, "dashboard", DefaultDashboard); err != nil {
		utils.ErrorResponse(http.StatusInternalServerError, "Failed to reset dashboard. Error: "+err.Error(), w)
		return
	}

	utils.JSONResponse(nil, w, req)
}
