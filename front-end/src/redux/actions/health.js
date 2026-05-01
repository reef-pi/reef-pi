import { getAction } from './api'

export const healthStatsLoaded = (stats) => {
  return ({
    type: 'HEALTH_STATS_LOADED',
    payload: stats
  })
}

export const fetchHealth = () => {
  return (
    getAction('health_stats', healthStatsLoaded))
}
