import {reduxGet, reduxPost, reduxPut, reduxDelete} from '../../utils/ajax'

export const inletsLoaded = (inlets) => {
  return ({
    type: 'INLETS_LOADED',
    payload: inlets
  })
}

export const fetchInlets = () => {
  return (
    reduxGet({
      url: '/api/inlets',
      success: inletsLoaded
    }))
}

export const deleteInlet = (id) => {
  return (
    reduxDelete({
      url: '/api/inlets/' + id,
      success: fetchInlets
    }))
}

export const createInlet = (inlet) => {
  return (
    reduxPut({
      url: '/api/inlets',
      data: inlet,
      success: fetchInlets
    }))
}
