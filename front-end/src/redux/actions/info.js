import { reduxGet } from '../../utils/ajax'

export const infoLoaded = (info) => {
  document.title = info.name
  return ({
    type: 'INFO_LOADED',
    payload: info
  })
}

export const fetchInfo = () => {
  return (reduxGet({
    url: '/api/info',
    success: infoLoaded
  }))
}
