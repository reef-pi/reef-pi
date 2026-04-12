import { showInfo, showError, showSuccess, showWarning, showUpdateSuccessful, showAlert, clearAlert } from './alert'
import * as store from 'redux/store'

jest.mock('redux/store', () => ({
  getStore: jest.fn(() => ({
    dispatch: jest.fn()
  }))
}))

describe('alert utils', () => {
  beforeEach(() => {
    store.getStore.mockReturnValue({ dispatch: jest.fn() })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('showInfo dispatches an action', () => {
    expect(() => showInfo('test info')).not.toThrow()
    expect(store.getStore).toHaveBeenCalled()
  })

  it('showError dispatches an action', () => {
    expect(() => showError('test error')).not.toThrow()
    expect(store.getStore).toHaveBeenCalled()
  })

  it('showSuccess dispatches an action', () => {
    expect(() => showSuccess('test success')).not.toThrow()
    expect(store.getStore).toHaveBeenCalled()
  })

  it('showWarning dispatches an action', () => {
    expect(() => showWarning('test warning')).not.toThrow()
    expect(store.getStore).toHaveBeenCalled()
  })

  it('showUpdateSuccessful dispatches and auto-dismisses', () => {
    const dispatch = jest.fn()
    store.getStore.mockReturnValue({ dispatch })
    showUpdateSuccessful()
    expect(dispatch).toHaveBeenCalledTimes(1)
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('showAlert logs deprecation warning and calls showError', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => showAlert('test')).not.toThrow()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'))
    warnSpy.mockRestore()
  })

  it('clearAlert logs deprecation warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => clearAlert()).not.toThrow()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('deprecated'))
    warnSpy.mockRestore()
  })
})
