import { reduxGet, reduxDelete, reduxPut, reduxPost } from './ajax'
import { showError } from 'utils/alert'
import 'isomorphic-fetch'

jest.mock('utils/alert', () => ({
  showError: jest.fn()
}))

const response = ({ ok = true, status = 200, body = { ok: true }, text = 'boom' } = {}) => ({
  ok,
  status,
  text: jest.fn(() => Promise.resolve(text)),
  json: jest.fn(() => Promise.resolve(body))
})

const success = data => ({
  type: 'API_SUCCESS',
  payload: data
})

describe('Ajax', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn(action => action)
    global.fetch = jest.fn()
    showError.mockClear()
  })

  it('reduxGet parses JSON responses before dispatching success', () => {
    global.fetch.mockResolvedValue(response({ body: { name: 'reef-pi' } }))

    return reduxGet({ url: '/foo', success })(dispatch).then(() => {
      expect(global.fetch).toHaveBeenCalledWith('/foo', {
        method: 'GET',
        credentials: 'same-origin',
        headers: expect.any(Headers)
      })
      expect(dispatch).toHaveBeenCalledWith(success({ name: 'reef-pi' }))
    })
  })

  it('reduxDelete dispatches the raw response by default', () => {
    const res = response()
    global.fetch.mockResolvedValue(res)

    return reduxDelete({ url: '/foo', success })(dispatch).then(() => {
      expect(global.fetch).toHaveBeenCalledWith('/foo', {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: expect.any(Headers)
      })
      expect(dispatch).toHaveBeenCalledWith(success(res))
    })
  })

  it('reduxPut serializes data and dispatches the raw response by default', () => {
    const res = response()
    global.fetch.mockResolvedValue(res)

    return reduxPut({ url: '/foo', data: { name: 'reef-pi' }, success })(dispatch).then(() => {
      expect(global.fetch).toHaveBeenCalledWith('/foo', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: expect.any(Headers),
        body: JSON.stringify({ name: 'reef-pi' })
      })
      expect(dispatch).toHaveBeenCalledWith(success(res))
    })
  })

  it('reduxPost sends raw bodies without JSON headers', () => {
    const res = response()
    const raw = new FormData()
    global.fetch.mockResolvedValue(res)

    return reduxPost({ url: '/foo', raw, success })(dispatch).then(() => {
      expect(global.fetch).toHaveBeenCalledWith('/foo', {
        method: 'POST',
        credentials: 'same-origin',
        body: raw
      })
      expect(dispatch).toHaveBeenCalledWith(success(res))
    })
  })

  it('shows authentication failures and skips success dispatch', () => {
    global.fetch.mockResolvedValue(response({ ok: false, status: 401 }))

    return reduxGet({ url: '/foo', success })(dispatch).then(() => {
      expect(showError).toHaveBeenCalledWith('Authentication failure')
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it('shows HTTP errors and skips success dispatch', () => {
    global.fetch.mockResolvedValue(response({ ok: false, status: 500, text: 'failed' }))

    return reduxPost({ url: '/foo', data: {}, success })(dispatch).then(() => {
      expect(showError).toHaveBeenCalledWith('failed | HTTP 500')
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it('calls failure callbacks for HTTP errors instead of showing an alert', () => {
    const failure = jest.fn()
    const res = response({ ok: false, status: 500 })
    global.fetch.mockResolvedValue(res)

    return reduxPost({ url: '/foo', data: {}, success, failure })(dispatch).then(() => {
      expect(failure).toHaveBeenCalledWith(res)
      expect(showError).not.toHaveBeenCalled()
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it('suppresses HTTP error alerts and skips success dispatch', () => {
    global.fetch.mockResolvedValue(response({ ok: false, status: 500 }))

    return reduxGet({ url: '/foo', success, suppressError: true })(dispatch).then(() => {
      expect(showError).not.toHaveBeenCalled()
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it('dispatches API_FAILURE when fetch rejects', () => {
    global.fetch.mockRejectedValue(new Error('offline'))

    return reduxGet({ url: '/foo', success })(dispatch).then(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'API_FAILURE',
        params: {
          url: '/foo',
          success,
          method: 'GET',
          parseJSON: true
        }
      })
    })
  })
})
