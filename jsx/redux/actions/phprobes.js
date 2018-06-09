import {reduxGet, reduxPost} from '../../utils/ajax'

export const phProbesLoaded = (s) => {
  return ({
    type: 'PH_PROBES_LOADED',
    payload: s
  })
}

export const fetchPhProbes = () => {
  return (reduxGet({
    url: '/api/phprobes',
    success: phProbesLoaded
  }))
}
