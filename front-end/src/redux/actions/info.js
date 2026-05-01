import { getAction } from './api'

export const infoLoaded = (info) => {
  document.title = info.name
  return ({
    type: 'INFO_LOADED',
    payload: info
  })
}

export const fetchInfo = () => {
  return (getAction('info', infoLoaded))
}
