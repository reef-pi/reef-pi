import { deleteAction, getAction, postAction, putAction } from './api'

export const jacksLoaded = (jacks) => {
  return ({
    type: 'JACKS_LOADED',
    payload: jacks
  })
}

export const fetchJacks = () => {
  return getAction('jacks', jacksLoaded)
}

export const deleteJack = (id) => {
  return deleteAction(['jacks', id], fetchJacks)
}

export const createJack = (jack) => {
  return putAction('jacks', jack, fetchJacks)
}

export const updateJack = (id, jack) => {
  return postAction(['jacks', id], jack, fetchJacks)
}
