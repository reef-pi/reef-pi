import {
  showInfo,
  showError,
  showSuccess,
  showWarning,
  showUpdateSuccessful,
  showAlert,
  clearAlert,
  setAlertDispatcher,
  clearAlertDispatcher
} from './alert'

describe('alert utils', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    setAlertDispatcher(dispatch)
    jest.useFakeTimers()
  })

  afterEach(() => {
    clearAlertDispatcher()
    jest.useRealTimers()
  })

  it('showInfo dispatches an action', () => {
    expect(() => showInfo('test info')).not.toThrow()
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ALERT_ADDED' }))
  })

  it('showError dispatches an action', () => {
    expect(() => showError('test error')).not.toThrow()
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ALERT_ADDED' }))
  })

  it('showSuccess dispatches an action', () => {
    expect(() => showSuccess('test success')).not.toThrow()
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ALERT_ADDED' }))
  })

  it('showWarning dispatches an action', () => {
    expect(() => showWarning('test warning')).not.toThrow()
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ALERT_ADDED' }))
  })

  it('showUpdateSuccessful dispatches and auto-dismisses', () => {
    showUpdateSuccessful()
    expect(dispatch).toHaveBeenCalledTimes(1)
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('does not create or require a store when no dispatcher is registered', () => {
    clearAlertDispatcher()
    expect(() => showError('test error')).not.toThrow()
    expect(dispatch).not.toHaveBeenCalled()
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
