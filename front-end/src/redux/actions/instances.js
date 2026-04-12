import { deleteAction, getAction, postAction, putAction } from './api'

export const instanceUpdated = () => {
  return ({
    type: 'INSTANCE_UPDATED'
  })
}

export const instancesLoaded = (s) => {
  return ({
    type: 'INSTANCES_LOADED',
    payload: s
  })
}

export const fetchInstances = () => {
  return getAction('instances', instancesLoaded)
}

export const instanceLoaded = (s) => {
  return ({
    type: 'INSTANCE_LOADED',
    payload: s
  })
}

export const fetchInstance = (id) => {
  return getAction(['instances', id], instanceLoaded)
}

export const createInstance = (a) => {
  return putAction('instances', a, fetchInstances)
}

export const updateInstance = (id, a) => {
  return postAction(['instances', id], a, fetchInstances)
}

export const deleteInstance = (id) => {
  return deleteAction(['instances', id], fetchInstances)
}
