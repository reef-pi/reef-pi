import { deleteAction, getAction, postAction, putAction } from './api'

export const atoUpdated = () => {
  return ({
    type: 'ATO_UPDATED'
  })
}

export const atosLoaded = (s) => {
  return ({
    type: 'ATOS_LOADED',
    payload: s
  })
}

export const fetchATOs = () => {
  return getAction('atos', atosLoaded)
}

export const atoLoaded = (s) => {
  return ({
    type: 'ATO_LOADED',
    payload: s
  })
}

export const fetchATO = (id) => {
  return getAction(['atos', id], atoLoaded)
}

export const atoUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'ATO_USAGE_LOADED',
      payload: { data: s, id: id }
    })
  }
}

export const fetchATOUsage = (id) => {
  return getAction(['atos', id, 'usage'], atoUsageLoaded(id))
}

export const createATO = (a) => {
  return putAction('atos', a, fetchATOs)
}

export const updateATO = (id, a) => {
  return postAction(['atos', id], a, fetchATOs)
}

export const deleteATO = (id) => {
  return deleteAction(['atos', id], fetchATOs)
}

export const resetATO = (id) => {
  return postAction(['atos', id, 'reset'], undefined, fetchATOs)
}
