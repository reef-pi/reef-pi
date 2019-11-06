import { reduxDelete, reduxGet } from 'utils/ajax'

export const errorsLoaded = (s) => {
  return ({
    type: 'ERRORS_LOADED',
    payload: s
  })
}

export const fetchErrors = () => {
  return (reduxGet({
    url: '/api/errors',
    success: errorsLoaded
  }))
}

export const deleteError = (id) => {
  return (reduxDelete({
    url: '/api/errors/' + id,
    success: fetchErrors
  }))
}

export const deleteErrors = () => {
  return (reduxDelete({
    url: '/api/errors/clear',
    success: fetchErrors
  }))
}
