import { showError } from 'utils/alert'

const handledError = Symbol('handledError')

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
    return Promise.resolve(handledError)
  }
  if (params.suppressError) {
    return Promise.resolve(handledError)
  }

  return response.text().then(err => {
    if (params.failure) {
      params.failure(response)
      return handledError
    }
    showError(err + ' | HTTP ' + response.status)
    return handledError
  })
}

function parseResponse (response, params) {
  if (!params.parseJSON) {
    return Promise.resolve(response)
  }
  return response.json()
}

function dispatchSuccess (data, params, dispatch) {
  if (data === handledError) {
    return undefined
  }
  return dispatch(params.success(data))
}

function request (params, dispatch) {
  return fetch(params.url, buildRequestOptions(params))
    .then(response => {
      if (!response.ok) {
        return handleErrorResponse(response, params)
      }
      return parseResponse(response, params)
    })
    .then(data => dispatchSuccess(data, params, dispatch))
    .catch(() => {
      dispatch({ type: 'API_FAILURE', params })
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
