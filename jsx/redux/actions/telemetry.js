import {reduxGet, reduxPost} from '../../utils/ajax'

export const telemetryLoaded = (s) => {
  return ({
    type: 'TELEMETRY_LOADED',
    payload: s
  })
}

export const fetchTelemetry = () => {
  return (reduxGet({
    url: '/api/telemetry',
    success: telemetryLoaded
  }))
}

export const updateTelemetry = (a) => {
  return (reduxPost({
    url: '/api/telemetry',
    data: a,
    success: fetchTelemetry
  }))
}
