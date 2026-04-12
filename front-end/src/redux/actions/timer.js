import { deleteAction, getAction, postAction, putAction } from './api'

export const timersLoaded = (s) => {
  return ({
    type: 'TIMERS_LOADED',
    payload: s
  })
}

export const timerDeleted = () => {
  return ({
    type: 'TIMER_DELETED'
  })
}

export const fetchTimers = () => {
  return getAction('timers', timersLoaded)
}

export const createTimer = (a) => {
  return putAction('timers', a, fetchTimers)
}

export const updateTimer = (id, a) => {
  return postAction(['timers', id], a, fetchTimers)
}

export const deleteTimer = (id) => {
  return deleteAction(['timers', id], fetchTimers)
}
