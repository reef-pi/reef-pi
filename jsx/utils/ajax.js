import SignIn from '../sign_in.jsx'
import {showAlert} from './alert'

function makeHeaders () {
  let headers = new Headers()
  let creds = SignIn.getCreds()
  let authHeader = 'Basic ' + window.btoa(creds.user + ':' + creds.password)
  headers.append('Authorization', authHeader)
  headers.append('Content-Type', 'application/json')
  return (headers)
}

export function reduxGet (params) {
  return dispatch => {
    return fetch(params.url, {method: 'GET', headers: makeHeaders()})
      .then((response) => {
        if (!response.ok) {
          if (response.status === 401) {
            showAlert('Authentication failure')
            SignIn.removeCreds()
            return
          }
          if (params.suppressError) {
            return
          }
          showAlert(response.statusText, response.text())
        }
        return response
      })
      .then((response) => response.json())
      .then((data) => dispatch(params.success(data)))
      .catch((v) => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert('GET API call failure.\nDetails:' + JSON.stringify(params), '\nError:\n', v)
      })
  }
}

export function reduxDelete (params) {
  return dispatch => {
    return fetch(params.url, {method: 'DELETE', headers: makeHeaders()})
      .then((response) => {
        if (!response.ok) {
          if (params.suppressError) {
            return
          }
          console.log(response)
          showAlert(response.statusText, response.text())
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch((v) => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert('DELETE API call failure.\nDetails:' + JSON.stringify(params), '\nError:\n', v)
      })
  }
}

export function reduxPut (params) {
  return dispatch => {
    return fetch(params.url, {method: 'PUT', headers: makeHeaders(), body: JSON.stringify(params.data)})
      .then((response) => {
        if (!response.ok) {
          if (params.suppressError) {
            return
          }
          showAlert(response.statusText, response.text())
        }
        return response
      })
      .then(() => dispatch(params.success()))
      .catch((v) => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert('PUT API call failure.\nDetails:' + JSON.stringify(params), '\nError:\n', v)
      })
  }
}

export function reduxPost (params) {
  return dispatch => {
    return fetch(params.url, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify(params.data)
    }).then((response) => {
      if (!response.ok) {
        if (params.suppressError) {
          return
        }
        showAlert(response.statusText, response.text())
      }
      return response
    })
      .then((data) => dispatch(params.success(data)))
      .catch((v) => {
        dispatch({ type: 'API_FAILURE', params: params })
        showAlert('POST API call failure.\nDetails:' + JSON.stringify(params), '\nError:\n', v)
      })
  }
}
