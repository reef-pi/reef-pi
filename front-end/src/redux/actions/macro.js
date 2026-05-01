import { deleteAction, getAction, postAction, putAction } from './api'

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
export const macroRevert = () => {
  return ({
    type: 'MACRO_REVERT'
  })
}

export const macrosLoaded = (s) => {
  return ({
    type: 'MACROS_LOADED',
    payload: s
  })
}

export const fetchMacros = () => {
  return getAction('macros', macrosLoaded)
}

export const macroUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'MACRO_USAGE_LOADED',
      payload: { data: s, id }
    })
  }
}

export const fetchMacroUsage = (id) => {
  return getAction(['macros', id, 'usage'], macroUsageLoaded(id))
}

export const createMacro = (a) => {
  return putAction('macros', a, fetchMacros)
}

export const updateMacro = (id, a) => {
  return postAction(['macros', id], a, fetchMacros)
}

export const deleteMacro = (id) => {
  return deleteAction(['macros', id], fetchMacros)
}

export const runMacro = (id) => {
  return postAction(['macros', id, 'run'], undefined, macroRun)
}
export const revertMacro = (id) => {
  return postAction(['macros', id, 'revert'], undefined, macroRevert)
}
