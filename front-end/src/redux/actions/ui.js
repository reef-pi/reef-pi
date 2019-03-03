import {reduxGet} from 'utils/ajax'
import $ from 'jquery'
import {fetchATOs} from './ato'
import {fetchInfo} from './info'
import {fetchDosingPumps} from './doser'
import {fetchDrivers} from './drivers'
import {fetchErrors} from './errors'
import {fetchOutlets} from './outlets'
import {fetchInlets} from './inlets'
import {fetchJacks} from './jacks'
import {fetchAnalogInputs} from './analog_inputs'
import {fetchTCs} from './tcs'
import {fetchLights} from './lights'
import {fetchPhProbes} from './phprobes'
import {fetchEquipment} from './equipment'
import {fetchTimers} from './timer'
import {capabilitiesLoaded} from './capabilities'
import {fetchInstances} from './instances'

export const fetchControllerData = (dispatch, capabilities) => {
  dispatch(fetchDrivers())
  dispatch(fetchInlets())
  dispatch(fetchErrors())
  dispatch(fetchInfo())
  dispatch(fetchJacks())
  dispatch(fetchOutlets())
  dispatch(fetchAnalogInputs())

  $.each(capabilities, (i, v) => {
    if (!v) {
      return
    }
    switch (i) {
      case 'ato':
        dispatch(fetchATOs())
        break
      case 'ph':
        dispatch(fetchPhProbes())
        break
      case 'temperature':
        dispatch(fetchTCs())
        break
      case 'lighting':
        dispatch(fetchLights())
        break
      case 'equipment':
        dispatch(fetchEquipment())
        break
      case 'doser':
        dispatch(fetchDosingPumps())
        break
      case 'timers':
        dispatch(fetchTimers())
        break
    }
  })
}

export const fetchManagerData = (dispatch) => {
  dispatch(fetchInstances())
}

export const fetchUIData = (dispatch) => {
  return (reduxGet({
    url: '/api/capabilities',
    success: (capabilities) => {
      if(capabilities['manager']) {
        fetchManagerData(dispatch)
      }else{
        fetchControllerData(dispatch, capabilities)
        return (capabilitiesLoaded(capabilities))
      }
    }
  }))
}
