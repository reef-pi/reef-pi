import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { acknowledgeAlert, clearAlerts, dismissAlert, dispatchAlert, useAlertsStore } from './useAlertsStore'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const HookProbe = ({ endpoint, onUpdate }) => {
  const store = useAlertsStore({ sseEndpoint: endpoint })
  onUpdate(store)
  return <span>{store.unacknowledgedCount}</span>
}

describe('design-system useAlertsStore', () => {
  beforeEach(() => {
    clearAlerts()
  })

  it('dispatches, acknowledges, dismisses, and clears alerts', () => {
    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<HookProbe onUpdate={store => updates.push(store)} />)
    })

    act(() => {
      dispatchAlert({ id: 'a1', severity: 'critical', title: 'Leak', detail: 'ATO leak' })
    })
    expect(updates.at(-1).alerts[0]).toMatchObject({ id: 'a1', severity: 'critical', acknowledged: false })
    expect(updates.at(-1).unacknowledgedCount).toBe(1)

    act(() => acknowledgeAlert('a1'))
    expect(updates.at(-1).alerts[0].acknowledged).toBe(true)
    expect(updates.at(-1).unacknowledgedCount).toBe(0)

    act(() => dismissAlert('a1'))
    expect(updates.at(-1).alerts).toEqual([])

    act(() => {
      updates.at(-1).dispatch({ id: 'a2', message: 'Needs attention' })
      updates.at(-1).clear()
    })
    expect(updates.at(-1).alerts).toEqual([])

    act(() => root.unmount())
  })

  it('subscribes to EventSource alerts and reconnects on errors', () => {
    jest.useFakeTimers()
    const close = jest.fn()
    const listeners = {}
    const EventSourceMock = jest.fn(() => ({
      addEventListener: (name, fn) => { listeners[name] = fn },
      close
    }))
    global.EventSource = EventSourceMock

    const updates = []
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<HookProbe endpoint='/api/alerts' onUpdate={store => updates.push(store)} />)
    })

    expect(EventSourceMock).toHaveBeenCalledWith('/api/alerts?since=0')

    act(() => {
      listeners.alert({ data: JSON.stringify({ id: 'sse-1', message: 'From SSE', ts: 42 }) })
    })
    expect(updates.at(-1).alerts[0].id).toBe('sse-1')

    act(() => {
      EventSourceMock.mock.results[0].value.onerror()
      jest.advanceTimersByTime(5000)
    })
    expect(close).toHaveBeenCalled()
    expect(EventSourceMock).toHaveBeenCalledTimes(2)

    act(() => root.unmount())
    jest.useRealTimers()
  })
})
