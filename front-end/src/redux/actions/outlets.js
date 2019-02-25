import {reduxGet, reduxPost, reduxPut, reduxDelete} from '../../utils/ajax'

export const outletsLoaded = (outlets) => {
  return ({
    type: 'OUTLETS_LOADED',
    payload: outlets
  })
}

export const fetchOutlets = () => {
  return (
    reduxGet({
      url: '/api/outlets',
      success: outletsLoaded
    }))
}

export const deleteOutlet = (id) => {
  return (
    reduxDelete({
      url: '/api/outlets/' + id,
      success: fetchOutlets
    }))
}

export const createOutlet = (outlet) => {
  return (
    reduxPut({
      url: '/api/outlets',
      data: outlet,
      success: fetchOutlets
    }))
}

export const updateOutlet = (id, outlet) => {
  return (
    reduxPost({
      url: '/api/outlets/' + id,
      data: outlet,
      success: fetchOutlets
    }))
}
