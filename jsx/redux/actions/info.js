import {reduxGet} from '../../utils/ajax'

export const infoLoaded = (info) => {
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
