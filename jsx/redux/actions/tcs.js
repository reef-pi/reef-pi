import {reduxGet, reduxPost} from '../../utils/ajax'

export const tcsLoaded = (s) => {
  return ({
    type: 'TCS_LOADED',
    payload: s
  })
}

export const fetchTCs = () => {
  return (reduxGet({
    url: '/api/tcs',
    success: tcsLoaded
  }))
}
