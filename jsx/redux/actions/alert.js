export const addAlert = (alert) => {
  return ({
    type: 'ALERT_ADDED',
    payload: alert
  })
}
export const delAlert = (alert) => {
  return ({
    type: 'ALERT_DELETED',
    payload: alert
  })
}
