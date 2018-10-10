export const addLog = (log) => {
  return ({
    type: 'LOG_ADDED',
    payload: log
  })
}
export const delLog = (log) => {
  return ({
    type: 'LOG_DELETED',
    payload: log
  })
}
