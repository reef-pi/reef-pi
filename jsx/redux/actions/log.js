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

export const displayedLog = (log) => {
  return ({
    type: 'LOG_DISPLAYED',
    payload: log
  })
}
