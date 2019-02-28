import {
  reduxPut,
  reduxDelete,
  reduxGet,
  reduxPost
} from '../../utils/ajax'

export const analogInputsLoaded = (ais) => {
  return ({
    type: 'ANALOG_INPUTS_LOADED',
    payload: ais
  })
}

export const fetchAnalogInputs = () => {
  return (
    reduxGet({
      url: '/api/analog_inputs',
      success: analogInputsLoaded
    }))
}

export const deleteAnalogInput = (id) => {
  return (
    reduxDelete({
      url: '/api/analog_inputs/' + id,
      success: fetchAnalogInputs
    }))
}

export const createAnalogInput = (ai) => {
  return (
    reduxPut({
      url: '/api/analog_inputs',
      data: ai,
      success: fetchAnalogInputs
    }))
}

export const updateAnalogInput = (id, ai) => {
  return (
    reduxPost({
      url: '/api/analog_inputs/' + id,
      data: ai,
      success: fetchAnalogInputs
    }))
}
