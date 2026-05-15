import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { useAckMutation } from './useAckMutation'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const HookProbe = ({ config, onUpdate }) => {
  const mutation = useAckMutation(config)
  onUpdate(mutation)
  return <button onClick={() => mutation.mutate('on')}>{mutation.state}</button>
}

const renderHook = config => {
  const updates = []
  const container = document.createElement('div')
  const root = createRoot(container)
  act(() => {
    root.render(<HookProbe config={config} onUpdate={mutation => updates.push(mutation)} />)
  })
  return {
    container,
    root,
    latest: () => updates.at(-1)
  }
}

describe('design-system useAckMutation', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ''
    jest.clearAllMocks()
  })

  it('moves from pending to ok when send resolves', async () => {
    const send = jest.fn(() => Promise.resolve())
    const hook = renderHook({ send })

    await act(async () => {
      hook.latest().mutate('on')
      await Promise.resolve()
    })

    expect(send).toHaveBeenCalledWith('on')
    expect(hook.latest().state).toBe('ok')
    expect(hook.latest().error).toBe(null)

    act(() => hook.root.unmount())
  })

  it('retries rejected sends and dispatches alert after max retries', async () => {
    const send = jest.fn(() => Promise.reject(new Error('network failed')))
    const onAlert = jest.fn()
    const hook = renderHook({
      send,
      maxRetries: 1,
      backoff: 'constant',
      backoffBaseMs: 10,
      onAlert
    })

    await act(async () => {
      hook.latest().mutate('off')
      await Promise.resolve()
    })
    expect(hook.latest().state).toBe('pending')

    await act(async () => {
      jest.advanceTimersByTime(10)
      await Promise.resolve()
    })

    expect(send).toHaveBeenCalledTimes(2)
    expect(hook.latest().state).toBe('error')
    expect(hook.latest().error).toBe('network failed')
    expect(onAlert).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'critical',
      message: 'network failed'
    }))

    act(() => hook.root.unmount())
  })

  it('handles ack timeouts, manual retry, and reset', () => {
    const send = jest.fn(() => new Promise(() => {}))
    const onAlert = jest.fn()
    const hook = renderHook({
      send,
      ackTimeoutMs: 20,
      maxRetries: 0,
      onAlert
    })

    act(() => hook.latest().retry())
    expect(send).not.toHaveBeenCalled()

    act(() => hook.latest().mutate('on'))
    act(() => jest.advanceTimersByTime(20))

    expect(hook.latest().state).toBe('error')
    expect(hook.latest().error).toBe('Command timed out after 0 retries')
    expect(onAlert).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Command timed out after 0 retries'
    }))

    act(() => hook.latest().retry())
    expect(send).toHaveBeenCalledTimes(2)

    act(() => hook.latest().reset())
    expect(hook.latest().state).toBe('idle')
    expect(hook.latest().error).toBe(null)

    act(() => hook.root.unmount())
  })
})
