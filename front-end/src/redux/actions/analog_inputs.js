import { deleteAction, getAction, postAction, putAction } from './api'

export const analogInputsLoaded = (ais) => {
  return ({
    type: 'ANALOG_INPUTS_LOADED',
    payload: ais
  })
}

export const fetchAnalogInputs = () => {
  return getAction('analog_inputs', analogInputsLoaded)
}

export const deleteAnalogInput = (id) => {
  return deleteAction(['analog_inputs', id], fetchAnalogInputs)
}

export const createAnalogInput = (ai) => {
  return putAction('analog_inputs', ai, fetchAnalogInputs)
}

export const updateAnalogInput = (id, ai) => {
  return postAction(['analog_inputs', id], ai, fetchAnalogInputs)
}
