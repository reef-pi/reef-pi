import {reduxPut, reduxDelete, reduxGet, reduxPost} from '../../utils/ajax'

export const macroUpdated = () => {
  return ({
    type: 'MACRO_UPDATED'
  })
}

export const macroRun = () => {
  return ({
    type: 'MACRO_RUN'
  })
}


export const macrosLoaded = (s) => {
  return ({
    type: 'MACROS_LOADED',
    payload: s
  })
}

export const fetchMacros = () => {
  return (reduxGet({
    url: '/api/macros',
    success: macrosLoaded
  }))
}

export const macroUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'MACRO_USAGE_LOADED',
      payload: {data: s, id: id}
    })
  }
}

export const fetchMacroUsage = (id) => {
  return (reduxGet({
    url: '/api/macros/' + id + '/usage',
    success: macroUsageLoaded(id)
  }))
}

export const createMacro = (a) => {
  return (reduxPut({
    url: '/api/macros',
    data: a,
    success: fetchMacros
  }))
}

export const updateMacro = (id, a) => {
  return (reduxPost({
    url: '/api/macros/' + id,
    data: a,
    success: fetchMacros
  }))
}

export const deleteMacro = (id) => {
  return (reduxDelete({
    url: '/api/macros/' + id,
    success: fetchMacros
  }))
}

export const runMacro = (id) => {
  return (reduxPost({
    url: '/api/macros/' + id+'/run',
    success: macroRun
  }))
}
