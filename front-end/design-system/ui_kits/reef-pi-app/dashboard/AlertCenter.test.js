import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { AlertCenter, AlertCenterBell } from './AlertCenter'
import { useAlertsStore } from '../hooks/useAlertsStore'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('../hooks/useAlertsStore', () => ({
  useAlertsStore: jest.fn()
}))

const alert = overrides => ({
  id: 'a1',
  severity: 'critical',
  title: 'Leak detected',
  detail: 'ATO sensor is wet',
  ts: Date.now() - 90_000,
  acknowledged: false,
  ...overrides
})

describe('design-system AlertCenter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-05-14T12:00:00Z'))
    useAlertsStore.mockReturnValue({
      alerts: [],
      unacknowledgedCount: 0,
      acknowledge: jest.fn(),
      dismiss: jest.fn()
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('renders the bell badge and toggles the panel', () => {
    useAlertsStore.mockReturnValue({
      alerts: [],
      unacknowledgedCount: 120,
      acknowledge: jest.fn(),
      dismiss: jest.fn()
    })
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<AlertCenterBell sseEndpoint='/api/alerts' />)
    })

    const button = container.querySelector('button')
    expect(button.getAttribute('aria-label')).toContain('120 unacknowledged')
    expect(container.textContent).toContain('99+')
    expect(useAlertsStore).toHaveBeenCalledWith({ sseEndpoint: '/api/alerts' })

    act(() => button.click())
    expect(button.getAttribute('aria-expanded')).toBe('true')

    act(() => root.unmount())
  })

  it('renders empty state when open without alerts', () => {
    const html = renderToStaticMarkup(<AlertCenter open onClose={jest.fn()} />)
    expect(html).toContain('No active alerts')
    expect(html).toContain('Alert center')
  })

  it('renders active and resolved rows with actions', () => {
    const acknowledge = jest.fn()
    const dismiss = jest.fn()
    const retry = jest.fn()
    useAlertsStore.mockReturnValue({
      alerts: [
        alert({ retry }),
        alert({ id: 'a2', severity: 'warn', title: 'Old alert', acknowledged: true, ts: Date.now() - 7200_000 })
      ],
      unacknowledgedCount: 1,
      acknowledge,
      dismiss
    })
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<AlertCenter open onClose={jest.fn()} />)
    })

    expect(container.textContent).toContain('Active (1)')
    expect(container.textContent).toContain('Resolved (1)')
    expect(container.textContent).toContain('Leak detected')
    expect(container.textContent).toContain('1m ago')
    expect(container.textContent).toContain('2h ago')

    const buttons = Array.from(container.querySelectorAll('button')).map(button => button.textContent)
    expect(buttons).toEqual(['', 'Retry', 'Ack', 'Dismiss', 'Dismiss'])

    act(() => container.querySelectorAll('button')[1].click())
    expect(retry).toHaveBeenCalled()
    expect(acknowledge).toHaveBeenCalledWith('a1')

    act(() => container.querySelectorAll('button')[3].click())
    expect(dismiss).toHaveBeenCalledWith('a1')

    act(() => root.unmount())
  })

  it('handles keyboard close, navigation, and acknowledge', () => {
    const acknowledge = jest.fn()
    const onClose = jest.fn()
    useAlertsStore.mockReturnValue({
      alerts: [alert({ id: 'a1' }), alert({ id: 'a2', severity: 'warn' })],
      unacknowledgedCount: 2,
      acknowledge,
      dismiss: jest.fn()
    })
    const container = document.createElement('div')
    const root = createRoot(container)

    act(() => {
      root.render(<AlertCenter open onClose={onClose} />)
    })
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })))
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })))
    expect(acknowledge).toHaveBeenCalledWith('a2')

    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
    expect(onClose).toHaveBeenCalled()

    act(() => root.unmount())
  })
})
