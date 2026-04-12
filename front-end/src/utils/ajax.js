import { showError } from 'utils/alert'

function makeHeaders () {
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')
  return headers
}

function buildRequestOptions (params) {
  const options = {
    method: params.method,
    credentials: 'same-origin'
  }

  if (params.raw) {
    options.body = params.raw
    return options
  }

  if (params.method === 'GET' || params.method === 'DELETE') {
    options.headers = makeHeaders()
    return options
  }

  options.headers = makeHeaders()
  options.body = JSON.stringify(params.data)
  return options
}

function handleErrorResponse (response, params) {
  if (response.status === 401) {
    showError('Authentication failure')
    return
  }
  if (params.suppressError) {
    return response
  }

  response.text().then(err => {
    if (params.failure) {
      params.failure(response)
      return
    }
    showError(err + ' | HTTP ' + response.status)
  })

  return response
}

function parseResponse (response, params) {
  if (response === undefined) {
    return Promise.resolve(undefined)
  }
  if (!params.parseJSON) {
    return Promise.resolve(response)
  }
  return response.json()
}

function request (params, dispatch) {
  return fetch(params.url, buildRequestOptions(params))
    .then(response => {
      if (!response.ok) {
        return handleErrorResponse(response, params)
      }
      return response
    })
    .then(response => parseResponse(response, params))
    .then(data => dispatch(params.success(data)))
    .catch(() => {
      dispatch({ type: 'API_FAILURE', params: params })
    })
}

function makeReduxRequest (params) {
  return dispatch => request(params, dispatch)
}

export function reduxGet (params) {
  return makeReduxRequest({
    ...params,
    method: 'GET',
    parseJSON: true
  })
}

export function reduxDelete (params) {
  return makeReduxRequest({
    ...params,
    method: 'DELETE'
  })
}

export function reduxPut (params) {
  return makeReduxRequest({
    ...params,
    method: 'PUT'
  })
}

export function reduxPost (params) {
  return makeReduxRequest({
    ...params,
    method: 'POST'
  })
}
