import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import AtoTile from './AtoTile'
import EquipmentStrip from './EquipmentStrip'
import MetricTile from './MetricTile'
import PhTile from './PhTile'
import TemperatureTile from './TemperatureTile'
import { useTimeSeries } from '../hooks/useTimeSeries'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock('../hooks/useTimeSeries', () => ({
  useTimeSeries: jest.fn()
}))

class ResizeObserverMock {
  observe () {}
  disconnect () {}
}

describe('design-system dashboard tiles', () => {
  beforeEach(() => {
    global.ResizeObserver = ResizeObserverMock
    jest.useFakeTimers()
    jest.setSystemTime?.(new Date('2026-05-14T12:00:00Z'))
    useTimeSeries.mockReturnValue({
      points: [
        { t: 1, v: 77.1 },
        { t: 2, v: 78.3 },
        { t: 3, v: 79.4 },
        { t: 4, v: 80.2 },
        { t: 5, v: 81.5 }
      ],
      loading: false,
      error: null,
      refetch: jest.fn()
    })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('renders MetricTile values, trend, children, sparkline, and alert footer', () => {
    const onAlertClick = jest.fn()
    const html = renderToStaticMarkup(
      <MetricTile
        metric='ph.display'
        label='pH'
        unit='pH'
        band={[8.1, 8.4]}
        globalRange='7d'
        formatValue={v => v.toFixed(1)}
        trendPrecision={1}
        alert={{ severity: 'critical', message: 'Probe offline', at: Date.now() - 90_000 }}
        onAlertClick={onAlertClick}
      >
        {({ value }) => <span>{value > 80 ? 'high' : 'ok'}</span>}
      </MetricTile>
    )

    expect(useTimeSeries).toHaveBeenCalledWith({ metric: 'ph.display', range: '7d', maxPoints: 80 })
    expect(html).toContain('pH')
    expect(html).toContain('81.5')
    expect(html).toContain('▲')
    expect(html).toContain('high')
    expect(html).toContain('Probe offline')
    expect(html).toContain('1m')
  })

  it('renders MetricTile loading, error, and empty states', () => {
    useTimeSeries.mockReturnValueOnce({ points: [], loading: true, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<MetricTile metric='m1' label='Metric' />)).toContain('reefpi-shimmer')

    useTimeSeries.mockReturnValueOnce({ points: [], loading: false, error: 'nope', refetch: jest.fn() })
    expect(renderToStaticMarkup(<MetricTile metric='m2' label='Metric' />)).toContain('Retry')

    useTimeSeries.mockReturnValueOnce({ points: [], loading: false, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<MetricTile metric='m3' label='Metric' />)).toContain('No Metric data yet')
  })

  it('renders ATO and pH tile status text from MetricTile children', () => {
    useTimeSeries.mockReturnValueOnce({ points: [{ t: 1, v: 15 }], loading: false, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<AtoTile globalRange='1d' targetLevel={50} />)).toContain('low')

    useTimeSeries.mockReturnValueOnce({ points: [{ t: 1, v: 8.2 }], loading: false, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<PhTile globalRange='1d' />)).toContain('within safe range')

    useTimeSeries.mockReturnValueOnce({ points: [{ t: 1, v: 7.9 }], loading: false, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<PhTile globalRange='1d' />)).toContain('outside safe range')
  })

  it('renders EquipmentStrip empty, sorted, toggle, retry, and keyboard flows', () => {
    expect(renderToStaticMarkup(<EquipmentStrip items={[]} />)).toContain('No equipment configured')

    const onToggle = jest.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const scrollIntoView = jest.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    act(() => {
      root.render(
        <EquipmentStrip
          onToggle={onToggle}
          items={[
            { id: 'old', name: 'Old Pump', state: 'off', lastToggledAt: 10 },
            { id: 'new', name: 'New Heater', state: 'on', lastToggledAt: 20, onSince: Date.now() - 65_000 },
            { id: 'bad', name: 'Bad Light', state: 'error', lastToggledAt: 5, errorMessage: 'failed' }
          ]}
        />
      )
    })

    const items = Array.from(container.querySelectorAll('[data-equip-item]'))
    expect(items.map(item => item.querySelector('a').textContent)).toEqual(['New Heater', 'Old Pump', 'Bad Light'])
    expect(items[0].textContent).toContain('on 1m')
    expect(items[2].textContent).toContain('failed')

    act(() => items[0].querySelector('button').click())
    expect(onToggle).toHaveBeenCalledWith('new', 'off')

    act(() => items[2].querySelector('button').click())
    expect(onToggle).toHaveBeenCalledWith('bad', 'on')

    items[0].focus()
    act(() => {
      container.querySelector('[role="list"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(scrollIntoView).toHaveBeenCalled()

    act(() => root.unmount())
    container.remove()
  })

  it('renders TemperatureTile loading, error, and data states', () => {
    useTimeSeries.mockReturnValueOnce({ points: [], loading: true, error: null, refetch: jest.fn() })
    expect(renderToStaticMarkup(<TemperatureTile metric='temp' unit='F' />)).toContain('reefpi-shimmer')

    useTimeSeries.mockReturnValueOnce({ points: [], loading: false, error: 'offline', refetch: jest.fn() })
    expect(renderToStaticMarkup(<TemperatureTile metric='temp' unit='F' />)).toContain('offline')

    useTimeSeries.mockReturnValueOnce({
      points: Array.from({ length: 24 }, (_, i) => ({ t: i, v: 76 + i / 10 })),
      loading: false,
      error: null,
      refetch: jest.fn()
    })
    const html = renderToStaticMarkup(<TemperatureTile metric='temp' unit='F' />)
    expect(html).toContain('Temperature')
    expect(html).toContain('78.3')
    expect(html).toContain('vs 1h ago')
  })
})
