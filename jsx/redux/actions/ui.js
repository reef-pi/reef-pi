import {reduxGet} from '../../utils/ajax'
import $ from 'jquery'
import {fetchATOs} from './ato'
import {fetchTCs} from './tcs'
import {fetchLights} from './lights'
import {fetchPhProbes} from './phprobes'
import {capabilitiesLoaded} from './capabilities'

export const fetchUIData= (dispatch) => {
  return (reduxGet({
    url: '/api/capabilities',
    success: (capabilities) => {
      $.each(capabilities, (i, v)=>{
        if(!v){
          return
        }
        switch(i){
          case 'ato':
            dispatch(fetchATOs())
            break;
          case 'ph':
            dispatch(fetchPhProbes())
            break;
          case 'temperature':
            dispatch(fetchTCs())
            break;
          case 'lighting':
            dispatch(fetchLights())
            break;
        }
      })
      return(capabilitiesLoaded(capabilities))
    }
  }))
}
