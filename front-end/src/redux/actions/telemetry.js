import { getAction, postAction } from './api'

export const telemetryLoaded = (s) => {
  return ({
    type: 'TELEMETRY_LOADED',
    payload: s
  })
}

export const testMessageSent = () => {
  return ({
    type: 'TELEMETRY_TEST_MESSAGE_SENT'
  })
}

export const fetchTelemetry = () => {
  return getAction('telemetry', telemetryLoaded)
}

export const updateTelemetry = (a) => {
  return postAction('telemetry', a, fetchTelemetry)
}

export const sendTestMessage = () => {
  return postAction(['telemetry', 'test_message'], {}, testMessageSent)
}
