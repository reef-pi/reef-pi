import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useEquipmentToggle } from './useEquipmentToggle'
import { dispatchAlert } from './useAlertsStore'
import { useAckMutation } from './useAckMutation'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('./useAlertsStore', () => ({
  dispatchAlert: jest.fn()
}))

jest.mock('./useAckMutation', () => ({
  useAckMutation: jest.fn()
}))

const HookProbe = ({ config, onUpdate }) => {
  const toggle = useEquipmentToggle(config)
  onUpdate(toggle)
  return <button onClick={() => toggle.mutate('on')}>{toggle.state}</button>
}

const renderHook = config => {
  const updates = []
  const root = createRoot(document.createElement('div'))
  act(() => {
    root.render(<HookProbe config={config} onUpdate={toggle => updates.push(toggle)} />)
  })
  return { root, latest: () => updates.at(-1) }
}

describe('design-system useEquipmentToggle', () => {
  let retry

  beforeEach(() => {
    retry = jest.fn()
    useAckMutation.mockImplementation(({ onAlert }) => {
      useAckMutation.lastOnAlert = onAlert
      return {
        mutate: jest.fn(),
        state: 'idle',
        error: null,
        retry,
        reset: jest.fn()
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('wires useAckMutation with retrying alert dispatch', () => {
    const send = jest.fn()
    const hook = renderHook({ id: 'eq-1', name: 'Return Pump', send, ackTimeoutMs: 50, maxRetries: 2 })

    expect(useAckMutation).toHaveBeenCalledWith(expect.objectContaining({
      send,
      ackTimeoutMs: 50,
      maxRetries: 2,
      backoff: 'exponential'
    }))

    act(() => {
      useAckMutation.lastOnAlert({
        severity: 'critical',
        message: 'failed to fetch',
        ts: 123
      })
    })

    expect(dispatchAlert).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'critical',
      title: 'Return Pump: command failed',
      detail: 'Network error — check connection',
      ts: 123
    }))

    const alert = dispatchAlert.mock.calls[0][0]
    alert.retry()
    expect(retry).toHaveBeenCalled()

    expect(hook.latest().state).toBe('idle')
    act(() => hook.root.unmount())
  })

  it('classifies timeout, permission, and fallback errors using id when name is missing', () => {
    const hook = renderHook({ id: 'eq-2', send: jest.fn() })

    act(() => useAckMutation.lastOnAlert({ severity: 'critical', message: 'timeout', ts: 1 }))
    act(() => useAckMutation.lastOnAlert({ severity: 'critical', message: '403 forbidden', ts: 2 }))
    act(() => useAckMutation.lastOnAlert({ severity: 'critical', message: 'relay failed', ts: 3 }))

    expect(dispatchAlert.mock.calls[0][0]).toEqual(expect.objectContaining({
      title: 'eq-2: command failed',
      detail: 'Relay did not acknowledge — device may be offline'
    }))
    expect(dispatchAlert.mock.calls[1][0].detail).toBe('Permission denied — check access control')
    expect(dispatchAlert.mock.calls[2][0].detail).toBe('relay failed')

    act(() => hook.root.unmount())
  })
})
