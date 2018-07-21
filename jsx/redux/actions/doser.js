import {reduxPut, reduxGet, reduxPost, reduxDelete} from '../../utils/ajax'

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

export const fetchDosingPumps = () => {
  return (reduxGet({
    url: '/api/doser/pumps',
    success: dosingPumpsLoaded
  }))
}

export const createDosingPump = (s) => {
  return (reduxPut({
    url: '/api/doser/pumps',
    success: fetchDosingPumps,
    data: s
  }))
}

export const deleteDosingPump = (s) => {
  return (reduxDelete({
    url: '/api/doser/pumps/' + s,
    success: fetchDosingPumps
  }))
}

export const updateDosingPumpSchedule = (id, s) => {
  return (reduxPost({
    url: '/api/doser/pumps/' + id + '/schedule',
    success: dosingPumpScheduleUpdated,
    data: s
  }))
}

export const calibrateDosingPump = (id, s) => {
  return (reduxPost({
    url: '/api/doser/pumps/' + id + '/calibrate',
    success: dosingPumpCalibrated,
    data: s
  }))
}
