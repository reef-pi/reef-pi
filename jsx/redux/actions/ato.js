import {reduxGet, reduxPost} from '../../utils/ajax'

export const atosLoaded = (s) => {
  return ({
    type: 'ATOS_LOADED',
    payload: s
  })
}

export const fetchATOs = () => {
  return (reduxGet({
    url: '/api/atos',
    success: atosLoaded
  }))
}

