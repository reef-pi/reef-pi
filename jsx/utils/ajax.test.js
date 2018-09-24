import { reduxGet, reduxDelete, reduxPut, reduxPost } from './ajax'
import iso from 'isomorphic-fetch'

let fecthOK = jest.fn().mockImplementation(() => {
  var p = new Promise(resolve => {
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
let fetch401 = jest.fn().mockImplementation(() => {
  var p = new Promise(resolve => {
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
let fetch500 = jest.fn().mockImplementation(() => {
  var p = new Promise(resolve => {
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
let dispatch = () => {
  return true
}
describe('Ajax', () => {
  beforeEach(() => {
    global.fetch = fecthOK
  })
  it('reduxGet', () => {
    reduxGet({ url: '#', data: {} })(dispatch)
    global.fetch = fetch401
    reduxGet({ url: '#', data: {} })(dispatch)
    global.fetch = fetch500
    reduxGet({ url: '#', data: {} })(dispatch)
    reduxGet({ url: '#', data: {}, suppressError: true })(dispatch)
    reduxGet({ url: '#', data: {}, suppressError: false })(dispatch)
  })
  it('reduxDelete', () => {
    reduxDelete({ url: '#', data: {} })(dispatch)
    global.fetch = fetch401
    reduxDelete({ url: '#', data: {} })(dispatch)
    global.fetch = fetch500
    reduxDelete({ url: '#', data: {} })(dispatch)
    reduxDelete({ url: '#', data: {}, suppressError: true })(dispatch)
    reduxDelete({ url: '#', data: {}, suppressError: false })(dispatch)
  })
  it('reduxPut ', () => {
    reduxPut({ url: '#', data: {} })(dispatch)
    global.fetch = fetch401
    reduxPut({ url: '#', data: {} })(dispatch)
    global.fetch = fetch500
    reduxPut({ url: '#', data: {} })(dispatch)
    reduxPut({ url: '#', data: {}, suppressError: true })(dispatch)
    reduxPut({ url: '#', data: {}, suppressError: false })(dispatch)
  })
  it('reduxPost ', () => {
    reduxPost({ url: '#', data: {} })(dispatch)
    global.fetch = fetch401
    reduxPost({ url: '#', data: {} })(dispatch)
    global.fetch = fetch500
    reduxPost({ url: '#', data: {} })(dispatch)
    reduxPost({ url: '#', data: {}, suppressError: true })(dispatch)
    reduxPost({ url: '#', data: {}, suppressError: false })(dispatch)
  })
})
