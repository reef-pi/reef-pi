import { logError } from 'utils/log'
import { showError } from 'utils/alert'
function makeHeaders () {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')
  return headers
}

export function reduxGet (params) {
  return dispatch => {
    return fetch(params.url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: makeHeaders()
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            showError('Authentication failure')
            logError('Authentication failure')
            return
          }
          if (params.suppressError) {
            return
          }
          response.text().then(err => {
            showError(err + ' | HTTP ' + response.status)
            logError(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(response => response.json())
      .then(data => dispatch(params.success(data)))
      .catch(() => {
        dispatch({ type: 'API_FAILURE', params: params })
      })
  }
}

export function reduxDelete (params) {
  return dispatch => {
    return fetch(params.url, {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: makeHeaders()
    })
      .then(response => {
        if (!response.ok) {
          if (params.suppressError) {
            return
          }
          response.text().then(err => {
            showError(err + ' | HTTP ' + response.status)
            logError(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch(() => {
        dispatch({ type: 'API_FAILURE', params: params })
      })
  }
}

export function reduxPut (params) {
  return dispatch => {
    return fetch(params.url, {
      method: 'PUT',
      credentials: 'same-origin',
      headers: makeHeaders(),
      body: JSON.stringify(params.data)
    })
      .then(response => {
        if (!response.ok) {
          if (params.suppressError) {
            return
          }
          response.text().then(err => {
            showError(err + ' | HTTP ' + response.status)
            logError(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch(() => {
        dispatch({ type: 'API_FAILURE', params: params })
      })
  }
}

export function reduxPost (params) {
  return dispatch => {
    const fParams = {
      method: 'POST',
      credentials: 'same-origin'
    }
    if (params.raw) {
      fParams.body = params.raw
    } else {
      fParams.body = JSON.stringify(params.data)
      fParams.headers = makeHeaders
    }
    return fetch(params.url, fParams).then(response => {
      if (!response.ok) {
        if (params.suppressError) {
          return
        }
        response.text().then(err => {
          if (params.failure) {
            params.failure(response)
            return
          }
          showError(err + ' | HTTP ' + response.status)
          logError(err + ' | HTTP ' + response.status)
        })
      }
      return response
    })
      .then(data => dispatch(params.success(data)))
      .catch(() => {
        dispatch({ type: 'API_FAILURE', params: params })
      })
  }
}
