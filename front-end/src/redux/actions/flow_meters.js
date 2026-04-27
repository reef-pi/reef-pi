import { reduxPut, reduxDelete, reduxGet, reduxPost } from '../../utils/ajax'

export const flowMetersLoaded = (s) => ({
  type: 'FLOW_METERS_LOADED',
  payload: s
})

export const flowMeterReadingsLoaded = (id) => (s) => ({
  type: 'FLOW_METER_READINGS_LOADED',
  payload: { readings: s, id }
})

export const fetchFlowMeters = () =>
  reduxGet({ url: '/api/flow_meters', success: flowMetersLoaded })

export const fetchFlowMeterReadings = (id) =>
  reduxGet({ url: '/api/flow_meters/' + id + '/readings', success: flowMeterReadingsLoaded(id) })

export const createFlowMeter = (f) =>
  reduxPut({ url: '/api/flow_meters', data: f, success: fetchFlowMeters })

export const updateFlowMeter = (id, f) =>
  reduxPost({ url: '/api/flow_meters/' + id, data: f, success: fetchFlowMeters })

export const deleteFlowMeter = (id) =>
  reduxDelete({ url: '/api/flow_meters/' + id, success: fetchFlowMeters })
