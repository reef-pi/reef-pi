import { reduxPut, reduxDelete, reduxGet, reduxPost } from 'utils/ajax'

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
  return (reduxGet({
    url: '/api/atos',
    success: atosLoaded
  }))
}

export const atoLoaded = (s) => {
  return ({
    type: 'ATO_LOADED',
    payload: s
  })
}

export const fetchATO = (id) => {
  return (reduxGet({
    url: '/api/atos/' + id,
    success: atoLoaded
  }))
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
  return (reduxGet({
    url: '/api/atos/' + id + '/usage',
    success: atoUsageLoaded(id)
  }))
}

export const createATO = (a) => {
  return (reduxPut({
    url: '/api/atos',
    data: a,
    success: fetchATOs
  }))
}

export const updateATO = (id, a) => {
  return (reduxPost({
    url: '/api/atos/' + id,
    data: a,
    success: fetchATOs
  }))
}

export const deleteATO = (id) => {
  return (reduxDelete({
    url: '/api/atos/' + id,
    success: fetchATOs
  }))
}

export const resetATO = (id) => {
  return (reduxPost({
    url: '/api/atos/' + id+"/reset",
    success: fetchATOs
  }))
}
