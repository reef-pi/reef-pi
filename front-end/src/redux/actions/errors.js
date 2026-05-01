import { deleteAction, getAction } from './api'

export const errorsLoaded = (s) => {
  return ({
    type: 'ERRORS_LOADED',
    payload: s
  })
}

export const fetchErrors = () => {
  return (getAction('errors', errorsLoaded))
}

export const deleteError = (id) => {
  return (deleteAction(['errors', id], fetchErrors))
}

export const deleteErrors = () => {
  return (deleteAction(['errors', 'clear'], fetchErrors))
}
