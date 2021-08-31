import { reduxGet, reduxDelete, reduxPut, reduxPost } from './ajax'
import 'isomorphic-fetch'

const fecthOK = jest.fn().mockImplementation(() => {
  const p = new Promise(resolve => {
    resolve({
      ok: true,
      status: 200,
      text: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      },
      json: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      }
    })
  })
  return p
})
const fetch401 = jest.fn().mockImplementation(() => {
  const p = new Promise(resolve => {
    resolve({
      ok: false,
      status: 401,
      text: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      },
      json: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      }
    })
  })
  return p
})
const fetch500 = jest.fn().mockImplementation(() => {
  const p = new Promise(resolve => {
    resolve({
      ok: false,
      status: 500,
      text: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      },
      json: () => {
        return new Promise(resolve => {
          resolve(true)
        })
      }
    })
  })
  return p
})
const dispatch = () => {
  return true
}
describe('Ajax', () => {
  beforeEach(() => {
    global.fetch = fecthOK
  })
  it('reduxGet', () => {
    reduxGet({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch401
    reduxGet({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch500
    reduxGet({ url: '/foo', data: {} })(dispatch)
    reduxGet({ url: '/foo', data: {}, suppressError: true })(dispatch)
    reduxGet({ url: '/foo', data: {}, suppressError: false })(dispatch)
  })
  it('reduxDelete', () => {
    reduxDelete({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch401
    reduxDelete({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch500
    reduxDelete({ url: '/foo', data: {} })(dispatch)
    reduxDelete({ url: '/foo', data: {}, suppressError: true })(dispatch)
    reduxDelete({ url: '/foo', data: {}, suppressError: false })(dispatch)
  })
  it('reduxPut ', () => {
    reduxPut({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch401
    reduxPut({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch500
    reduxPut({ url: '/foo', data: {} })(dispatch)
    reduxPut({ url: '/foo', data: {}, suppressError: true })(dispatch)
    reduxPut({ url: '/foo', data: {}, suppressError: false })(dispatch)
  })
  it('reduxPost ', () => {
    reduxPost({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch401
    reduxPost({ url: '/foo', data: {} })(dispatch)
    global.fetch = fetch500
    reduxPost({ url: '/foo', data: {} })(dispatch)
    reduxPost({ url: '/foo', data: {}, suppressError: true })(dispatch)
    reduxPost({ url: '/foo', data: {}, suppressError: false })(dispatch)
  })
})
