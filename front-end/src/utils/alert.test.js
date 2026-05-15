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
import { dispatchAlert as dispatchToAlertCenter } from '../../design-system/ui_kits/reef-pi-app/hooks/useAlertsStore'

jest.mock('../../design-system/ui_kits/reef-pi-app/hooks/useAlertsStore', () => ({
  dispatchAlert: jest.fn()
}))

describe('alert utils', () => {
  let dispatch

  beforeEach(() => {
    dispatch = jest.fn()
    setAlertDispatcher(dispatch)
    window.FEATURE_FLAGS = {}
    jest.useFakeTimers()
  })

  afterEach(() => {
    clearAlertDispatcher()
    window.FEATURE_FLAGS = {}
    jest.useRealTimers()
    jest.clearAllMocks()
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

  it('mirrors warning and error alerts into AlertCenter when feature flag is enabled', () => {
    jest.setSystemTime?.(new Date('2026-05-15T12:00:00Z'))
    window.FEATURE_FLAGS = { alert_center: true }

    showError('critical failure')
    showWarning('needs attention')

    expect(dispatchToAlertCenter).toHaveBeenCalledWith({
      severity: 'critical',
      title: 'critical failure',
      ts: Date.now()
    })
    expect(dispatchToAlertCenter).toHaveBeenCalledWith({
      severity: 'warn',
      title: 'needs attention',
      ts: Date.now()
    })
  })

  it('does not mirror info and success alerts into AlertCenter', () => {
    window.FEATURE_FLAGS = { alert_center: true }

    showInfo('just so you know')
    showSuccess('saved')

    expect(dispatchToAlertCenter).not.toHaveBeenCalled()
  })
})
