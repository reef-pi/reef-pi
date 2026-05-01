import { deleteAction, getAction, postAction, putAction } from './api'

export const outletsLoaded = (outlets) => {
  return ({
    type: 'OUTLETS_LOADED',
    payload: outlets
  })
}

export const fetchOutlets = () => {
  return getAction('outlets', outletsLoaded)
}

export const deleteOutlet = (id) => {
  return deleteAction(['outlets', id], fetchOutlets)
}

export const createOutlet = (outlet) => {
  return putAction('outlets', outlet, fetchOutlets)
}

export const updateOutlet = (id, outlet) => {
  return postAction(['outlets', id], outlet, fetchOutlets)
}
