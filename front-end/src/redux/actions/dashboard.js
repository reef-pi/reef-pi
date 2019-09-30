import { reduxGet, reduxPost } from '../../utils/ajax'

export const dashboardLoaded = (s) => {
  return ({
    type: 'DASHBOARD_LOADED',
    payload: s
  })
}

export const fetchDashboard = () => {
  return (reduxGet({
    url: '/api/dashboard',
    success: dashboardLoaded
  }))
}

export const dashboardUpdated = () => {
  return ({
    type: 'DASHBOARD_UPDATED'
  })
}

export const updateDashboard = (s) => {
  return (reduxPost({
    url: '/api/dashboard',
    success: dashboardUpdated,
    data: s
  }))
}
