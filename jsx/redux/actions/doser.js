import {reduxPut, reduxGet, reduxPost, reduxDelete} from '../../utils/ajax'

export const dosingPumpsLoaded = (s) => {
  return ({
    type: 'DOSING_PUMPS_LOADED',
    payload: s
  })
}

export const fetchDosingPumps = () => {
  return (reduxGet({
    url: '/api/doser/pumps',
    success: dosingPumpsLoaded
  }))
}

export const dosingPumpCreated = () => {
  return ({
    type: 'DOSING_PUMP_CREATED'
  })
}

export const createDosingPump = (s) => {
  return (reduxPut({
    url: '/api/doser/pumps',
    success: dosingPumpCreated,
    data: s
  }))
}

export const dosingPumpDeleted = () => {
  return ({
    type: 'DOSING_PUMP_DELETED'
  })
}

export const deleteDosingPump = (s) => {
  return (reduxDelete({
    url: '/api/doser/pumps',
    success: dosingPumpDeleted,
    data: {}
  }))
}

export const dosingPumpScheduleUpdated = () => {
  return ({
    type: 'DOSING_PUMP_SCHEDULE_UPDATED'
  })
}

export const updateDosingPumpSchedule = (id, s) => {
  return (reduxPost({
    url: '/api/doser/pumps/'+id+'/schedule',
    success: dosingPumpScheduleUpdated,
    data: s
  }))
}

export const dosingPumpCalibrated = () => {
  return ({
    type: 'DOSING_PUMP_CALIBRATED'
  })
}

export const calibrateDosingPump = (id, s) => {
  return (reduxPost({
    url: '/api/doser/pumps/'+id+'/calibrate',
    success: dosingPumpCalibrated,
    data: s
  }))
}
