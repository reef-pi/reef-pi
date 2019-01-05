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
import {fetchTCs} from './tcs'
import {fetchLights} from './lights'
import {fetchPhProbes} from './phprobes'
import {fetchEquipment} from './equipment'
import {capabilitiesLoaded} from './capabilities'

export const fetchUIData = (dispatch) => {
  return (reduxGet({
    url: '/api/capabilities',
    success: (capabilities) => {
      dispatch(fetchDrivers())
      dispatch(fetchInlets())
      dispatch(fetchErrors())
      dispatch(fetchInfo())
      dispatch(fetchJacks())
      dispatch(fetchOutlets())

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
        }
      })
      return (capabilitiesLoaded(capabilities))
    }
  }))
}
