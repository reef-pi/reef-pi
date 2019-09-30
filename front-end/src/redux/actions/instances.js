import { reduxPut, reduxDelete, reduxGet, reduxPost } from 'utils/ajax'

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
  return (reduxGet({
    url: '/api/instances',
    success: instancesLoaded
  }))
}

export const instanceLoaded = (s) => {
  return ({
    type: 'INSTANCE_LOADED',
    payload: s
  })
}

export const fetchInstance = (id) => {
  return (reduxGet({
    url: '/api/instances/' + id,
    success: instanceLoaded
  }))
}

export const createInstance = (a) => {
  return (reduxPut({
    url: '/api/instances',
    data: a,
    success: fetchInstances
  }))
}

export const updateInstance = (id, a) => {
  return (reduxPost({
    url: '/api/instances/' + id,
    data: a,
    success: fetchInstances
  }))
}

export const deleteInstance = (id) => {
  return (reduxDelete({
    url: '/api/instances/' + id,
    success: fetchInstances
  }))
}
