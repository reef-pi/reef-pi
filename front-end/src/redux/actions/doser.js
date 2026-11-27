import { deleteAction, getAction, postAction, putAction } from './api'

export const dosingPumpsLoaded = (s) => {
  return ({
    type: 'DOSING_PUMPS_LOADED',
    payload: s
  })
}

export const dosingPumpScheduleUpdated = () => {
  return ({
    type: 'DOSING_PUMP_SCHEDULE_UPDATED'
  })
}

export const dosingPumpCalibrated = () => {
  return ({
    type: 'DOSING_PUMP_CALIBRATED'
  })
}

export const dosingPumpCalibrationSaved = () => {
  return ({
    type: 'DOSING_PUMP_CALIBRATION_SAVED'
  })
}

export const fetchDosingPumps = () => {
  return getAction(['doser', 'pumps'], dosingPumpsLoaded)
}

export const createDosingPump = (s) => {
  return putAction(['doser', 'pumps'], s, fetchDosingPumps)
}

export const updateDosingPump = (id, s) => {
  return postAction(['doser', 'pumps', id], s, fetchDosingPumps)
}

export const deleteDosingPump = (s) => {
  return deleteAction(['doser', 'pumps', s], fetchDosingPumps)
}

export const updateDosingPumpSchedule = (id, s) => {
  return postAction(['doser', 'pumps', id, 'schedule'], s, dosingPumpScheduleUpdated)
}

export const calibrateDosingPump = (id, s) => {
  return postAction(['doser', 'pumps', id, 'calibrate'], s, dosingPumpCalibrated)
}

// Resolves to the saved action only when the controller accepted the result (and refreshes the
// pumps so the new rate shows); a rejected save resolves to undefined after its error toast.
export const saveDosingPumpCalibration = (id, s) => {
  return postAction(['doser', 'pumps', id, 'calibrate', 'save'], s, () => dispatch => {
    dispatch(fetchDosingPumps())
    return dispatch(dosingPumpCalibrationSaved())
  })
}

export const fetchDoserUsage = (id) => {
  return getAction(['doser', 'pumps', id, 'usage'], doserUsageLoaded(id), { silent404: true })
}

export const doserUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'DOSER_USAGE_LOADED',
      payload: { data: s, id }
    })
  }
}
