import { deleteAction, getAction, postAction, putAction } from './api'

export const inletsLoaded = (inlets) => {
  return ({
    type: 'INLETS_LOADED',
    payload: inlets
  })
}

export const fetchInlets = () => {
  return getAction('inlets', inletsLoaded)
}

export const deleteInlet = (id) => {
  return deleteAction(['inlets', id], fetchInlets)
}

export const createInlet = (inlet) => {
  return putAction('inlets', inlet, fetchInlets)
}

export const updateInlet = (id, inlet) => {
  return postAction(['inlets', id], inlet, fetchInlets)
}
