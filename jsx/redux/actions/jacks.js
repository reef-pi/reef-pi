import {reduxPut, reduxDelete, reduxGet, reduxPost} from '../../utils/ajax'

export const jacksLoaded = (jacks) => {
  return ({
    type: 'JACKS_LOADED',
    payload: jacks
  })
}

export const fetchJacks = () => {
  return (
    reduxGet({
      url: '/api/jacks',
      success: jacksLoaded
    }))
}

export const deleteJack = (id) => {
  return (
    reduxDelete({
      url: '/api/jacks/' + id,
      success: fetchJacks
    }))
}

export const createJack = (jack) => {
  return (
    reduxPut({
      url: '/api/jacks',
      data: jack,
      success: fetchJacks
    }))
}

export const updateJack = (id, jack) => {
  return (
    reduxPost({
      url: '/api/jack/'+id,
      data: jack,
      success: fetchJacks
  }))
}
