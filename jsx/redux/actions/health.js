import {reduxGet, reduxPost, reduxPut, reduxDelete} from '../../utils/ajax'

export const healthStatsLoaded = (stats) => {
  return ({
    type: 'HEALTH_STATS_LOADED',
    payload: stats
  })
}

export const fetchHealth = () => {
  return (
    reduxGet({
      url: '/api/health_stats',
      success: healthStatsLoaded
    }))
}

