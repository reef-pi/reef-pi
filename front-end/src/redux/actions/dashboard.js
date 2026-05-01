import { getAction, postAction } from './api'

export const dashboardLoaded = (s) => {
  return ({
    type: 'DASHBOARD_LOADED',
    payload: s
  })
}

export const fetchDashboard = () => {
  return getAction('dashboard', dashboardLoaded)
}

export const dashboardUpdated = () => {
  return ({
    type: 'DASHBOARD_UPDATED'
  })
}

export const updateDashboard = (s) => {
  return postAction('dashboard', s, dashboardUpdated)
}
