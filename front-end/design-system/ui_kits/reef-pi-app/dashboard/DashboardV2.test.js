import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'

let mockAlerts = []
jest.mock('../hooks/useAlertsStore', () => ({
  useAlertsStore: () => ({ alerts: mockAlerts })
}))

jest.mock('./SystemStrip', () => function MockSystemStrip (props) {
  return (
    <section
      data-testid='system-strip'
      data-sse-endpoint={props.sseEndpoint}
      data-alerts={JSON.stringify(props.alerts || [])}
    >
      <button data-testid='system-strip-alert-trigger' onClick={props.onAlertClick}>alerts</button>
    </section>
  )
})
jest.mock('./AlertCenter', () => ({
  AlertCenter: props => <section data-testid='alert-center' data-open={props.open ? 'yes' : 'no'} />
}))
jest.mock('./TemperatureTile', () => function MockTemperatureTile (props) {
  return <section data-testid='temperature-tile' data-global-range={props.globalRange} data-alert={JSON.stringify(props.alert || null)} />
})
jest.mock('./PhTile', () => function MockPhTile (props) {
  return <section data-testid='ph-tile' data-global-range={props.globalRange} data-alert={JSON.stringify(props.alert || null)} />
})
jest.mock('./AtoTile', () => function MockAtoTile (props) {
  return <section data-testid='ato-tile' data-global-range={props.globalRange} data-target-level={props.targetLevel} data-alert={JSON.stringify(props.alert || null)} />
})
jest.mock('./EquipmentStrip', () => function MockEquipmentStrip (props) {
  return <section data-testid='equipment-strip' data-items={props.items?.length || 0} data-toggle={props.onToggle ? 'yes' : 'no'} />
})

import DashboardV2 from './DashboardV2'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function renderDashboard (props = {}) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  act(() => {
    root.render(<DashboardV2 {...props} />)
  })

  return {
    container,
    root,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    }
  }
}

function dataAlert (container, testId) {
  return JSON.parse(container.querySelector(`[data-testid="${testId}"]`).getAttribute('data-alert'))
}

describe('design-system DashboardV2', () => {
  beforeEach(() => {
    mockAlerts = []
    window.localStorage.clear()
  })

  afterEach(() => {
    window.FEATURE_FLAGS = {}
  })

  it('renders children unchanged when dashboard_v2 is disabled', () => {
    window.FEATURE_FLAGS = { dashboard_v2: false }
    expect(renderToStaticMarkup(
      <DashboardV2><span>Legacy dashboard</span></DashboardV2>
    )).toContain('Legacy dashboard')
    expect(renderToStaticMarkup(<DashboardV2 />)).toBe('')
  })

  it('composes dashboard v2 sections when enabled', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    const onToggle = jest.fn()
    const equipment = [{ id: 'pump', name: 'Pump', state: 'on' }]
    const { container, cleanup } = renderDashboard({
      equipment,
      temperatureControllers: [{ id: '1' }],
      phProbes: [{ id: '1' }],
      atos: [{ id: '1' }],
      onToggle,
      sseEndpoint: '/api/alerts',
      globalRange: '7d',
      targetAtoLevel: 50,
      children: <span>Legacy dashboard</span>
    })

    expect(container.querySelector('[data-testid="smoke-dashboard-v2"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="system-strip"]').getAttribute('data-sse-endpoint')).toBe('/api/alerts')
    expect(container.querySelector('[data-testid="temperature-tile"]').getAttribute('data-global-range')).toBe('7d')
    expect(container.querySelector('[data-testid="ph-tile"]').getAttribute('data-global-range')).toBe('7d')
    expect(container.querySelector('[data-testid="ato-tile"]').getAttribute('data-target-level')).toBe('50')
    expect(container.querySelector('[data-testid="equipment-strip"]').getAttribute('data-items')).toBe('1')
    expect(container.querySelector('[data-testid="equipment-strip"]').getAttribute('data-toggle')).toBe('yes')

    cleanup()
  })

  it('passes active alerts into the system strip and opens the alert center from the strip', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    mockAlerts = [
      { id: '1', title: 'Temperature high', detail: 'Water temperature exceeded limit', severity: 'critical', ts: 101 },
      { id: '2', title: 'Old alert', detail: 'Already handled', severity: 'warn', ts: 102, acknowledged: true }
    ]

    const { container, cleanup } = renderDashboard({
      equipment: [],
      temperatureControllers: [{ id: '1' }],
      phProbes: [{ id: '1' }],
      atos: [{ id: '1' }],
      sseEndpoint: '/api/alerts'
    })

    expect(JSON.parse(container.querySelector('[data-testid="system-strip"]').getAttribute('data-alerts'))).toEqual([mockAlerts[0]])
    expect(container.querySelector('[data-testid="alert-center"]').getAttribute('data-open')).toBe('no')

    act(() => container.querySelector('[data-testid="system-strip-alert-trigger"]').click())
    expect(container.querySelector('[data-testid="alert-center"]').getAttribute('data-open')).toBe('yes')
    expect(container.querySelector('#configure-dashboard')).toBeNull()

    cleanup()
  })

  it('maps unacknowledged alert-center messages to matching tiles', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    mockAlerts = [
      { title: 'Temperature high', detail: 'Water temperature exceeded limit', severity: 'critical', ts: 101 },
      { title: 'pH warning', detail: '', severity: 'warn', ts: 102 },
      { title: 'ATO reservoir', detail: 'Water level low', severity: 'warn', ts: 103 },
      { title: 'Temperature old', detail: 'acknowledged alert', severity: 'critical', ts: 104, acknowledged: true }
    ]

    const { container, cleanup } = renderDashboard({
      equipment: [],
      temperatureControllers: [{ id: '1' }],
      phProbes: [{ id: '1' }],
      atos: [{ id: '1' }],
      sseEndpoint: '/api/alerts'
    })

    expect(dataAlert(container, 'temperature-tile')).toEqual({
      severity: 'critical',
      message: 'Water temperature exceeded limit',
      at: 101
    })
    expect(dataAlert(container, 'ph-tile')).toEqual({
      severity: 'warn',
      message: 'pH warning',
      at: 102
    })
    expect(dataAlert(container, 'ato-tile')).toEqual({
      severity: 'warn',
      message: 'Water level low',
      at: 103
    })

    cleanup()
  })

  it('leaves tile alerts unset when no alert keywords match', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    mockAlerts = [
      { title: 'Camera offline', detail: 'No recent images', severity: 'critical', ts: 105 }
    ]

    const { container, cleanup } = renderDashboard({
      equipment: [],
      temperatureControllers: [{ id: '1' }],
      phProbes: [{ id: '1' }],
      atos: [{ id: '1' }]
    })

    expect(dataAlert(container, 'temperature-tile')).toBeNull()
    expect(dataAlert(container, 'ph-tile')).toBeNull()
    expect(dataAlert(container, 'ato-tile')).toBeNull()

    cleanup()
  })
})
