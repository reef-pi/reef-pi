import { confirm, showModal } from './confirm'

jest.mock('confirm', () => {
  const React = require('react')
  return class MockConfirm extends React.Component {
    componentDidMount () {
      this.promise = {
        always: jest.fn(() => ({ promise: jest.fn(() => Promise.resolve()) }))
      }
    }

    render () {
      return React.createElement('div', null, 'confirm')
    }
  }
}, { virtual: true })

const mockAlways = jest.fn(callback => {
  callback()
  return { promise: jest.fn(() => Promise.resolve()) }
})
const mockRender = jest.fn(element => {
  const modalRef = element?.props?.ref
  if (modalRef) {
    modalRef.current = { promise: { always: mockAlways } }
  }
})
const mockUnmount = jest.fn()

jest.mock('react-dom', () => ({
  flushSync: jest.fn(fn => fn())
}))

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: mockRender,
    unmount: mockUnmount
  }))
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
    return showModal(React.createElement(require('confirm')))
      .then(() => new Promise(resolve => setTimeout(resolve, 0)))
      .then(() => {
      expect(mockRender).toHaveBeenCalled()
      expect(mockAlways).toHaveBeenCalled()
      expect(mockUnmount).toHaveBeenCalled()
      })
  })
})
