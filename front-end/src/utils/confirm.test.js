import { confirm, showModal } from './confirm'

jest.mock('confirm', () => {
  const React = require('react')
  return function MockConfirm () { return React.createElement('div', null, 'confirm') }
}, { virtual: true })

jest.mock('react-dom', () => ({
  render: jest.fn(() => ({
    promise: {
      always: jest.fn(() => ({ promise: jest.fn(() => Promise.resolve()) }))
    }
  })),
  unmountComponentAtNode: jest.fn()
}))

describe('confirm utils', () => {
  it('confirm is a function', () => {
    expect(typeof confirm).toBe('function')
  })

  it('showModal is a function', () => {
    expect(typeof showModal).toBe('function')
  })

  it('showModal appends a div and renders into it', () => {
    const React = require('react')
    const ReactDOM = require('react-dom')
    showModal(React.createElement('div'))
    expect(ReactDOM.render).toHaveBeenCalled()
  })
})
