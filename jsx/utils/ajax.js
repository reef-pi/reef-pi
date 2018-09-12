import SignIn from 'sign_in'
import { showAlert } from 'utils/alert'

function makeHeaders () {
  let headers = new Headers()
  let creds = SignIn.getCreds()
  let authHeader = 'Basic ' + window.btoa(creds.user + ':' + creds.password)
  headers.append('Authorization', authHeader)
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
            showAlert('Authentication failure')
            return
          }
          if (params.suppressError) {
            return
          }
          response.text().then(err => {
            showAlert(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(response => response.json())
      .then(data => dispatch(params.success(data)))
      .catch(v => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert(
          'GET API call failure.\nDetails:' + JSON.stringify(params),
          '\nError:\n',
          v
        )
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
            showAlert(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch(v => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert(
          'DELETE API call failure.\nDetails:' + JSON.stringify(params),
          '\nError:\n',
          v
        )
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
            showAlert(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch(v => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert(
          'PUT API call failure.\nDetails:' + JSON.stringify(params),
          '\nError:\n',
          v
        )
      })
  }
}

export function reduxPost (params) {
  return dispatch => {
    return fetch(params.url, {
      method: 'POST',
      headers: makeHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(params.data)
    })
      .then(response => {
        if (!response.ok) {
          if (params.suppressError) {
            return
          }
          response.text().then(err => {
            showAlert(err + ' | HTTP ' + response.status)
          })
        }
        return response
      })
      .then(data => dispatch(params.success(data)))
      .catch(v => {
        if (params.error) {
          params.error(v)
        } else {
          dispatch({ type: 'API_FAILURE', params: params })
          showAlert(
            'POST API call failure.\nDetails:' + JSON.stringify(params),
            '\nError:\n',
            v
          )
        }
      })
  }
}
