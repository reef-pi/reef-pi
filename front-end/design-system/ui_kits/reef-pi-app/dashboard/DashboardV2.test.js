import React, { act } from 'react'
import { createRoot } from 'react-dom/client'

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
  return <section data-testid='temperature-tile' data-global-range={props.globalRange} data-label={props.label} data-alert={JSON.stringify(props.alert || null)} />
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

  it('composes dashboard sections', () => {
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
      targetAtoLevel: 50
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

  it('names the temperature tile after the temperature controller', () => {
    const { container, cleanup } = renderDashboard({
      equipment: [],
      temperatureControllers: [{ id: '1', name: 'AdafruitTempSensor' }],
      phProbes: [],
      atos: [],
      sseEndpoint: '/api/alerts'
    })

    expect(container.querySelector('[data-testid="temperature-tile"]').getAttribute('data-label')).toBe('AdafruitTempSensor')
    cleanup()
  })

  it('replaces oversized empty tiles with one compact setup checklist on a fresh controller', () => {
    const { container, cleanup } = renderDashboard({
      capabilities: { temperature: true, ph: true, ato: true, equipment: true },
      equipment: [],
      temperatureControllers: [],
      phProbes: [],
      atos: []
    })

    const setup = container.querySelector('[data-testid="dashboard-setup"]')
    expect(setup).toBeTruthy()
    expect(setup.querySelectorAll('h2')).toHaveLength(1)
    expect(Array.from(setup.querySelectorAll('a')).map(link => link.getAttribute('href'))).toEqual([
      '/temperature',
      '/ph',
      '/ato',
      '/equipment'
    ])
    expect(container.textContent).not.toContain('Not configured')
    expect(container.querySelector('[data-testid="equipment-strip"]')).toBeNull()

    cleanup()
  })

  it('keeps configured metrics and lists only supported unfinished setup', () => {
    const { container, cleanup } = renderDashboard({
      capabilities: { temperature: true, ph: true, ato: false, equipment: true },
      equipment: [],
      temperatureControllers: [{ id: 'temp-1', name: 'Display tank' }],
      phProbes: [],
      atos: []
    })

    expect(container.querySelector('[data-testid="temperature-tile"]')).toBeTruthy()
    expect(Array.from(container.querySelectorAll('[data-testid="dashboard-setup"] a')).map(link => link.getAttribute('href'))).toEqual([
      '/ph',
      '/equipment'
    ])
    expect(container.querySelector('[href="/temperature"]')).toBeNull()
    expect(container.querySelector('[href="/ato"]')).toBeNull()

    cleanup()
  })

  it('omits setup guidance when every supported resource is configured', () => {
    const { container, cleanup } = renderDashboard({
      capabilities: { temperature: true, ph: true, ato: true, equipment: true },
      equipment: [{ id: 'pump', name: 'Pump', state: 'on' }],
      temperatureControllers: [{ id: 'temp-1' }],
      phProbes: [{ id: 'ph-1' }],
      atos: [{ id: 'ato-1' }]
    })

    expect(container.querySelector('[data-testid="dashboard-setup"]')).toBeNull()
    expect(container.querySelector('[data-testid="equipment-strip"]')).toBeTruthy()

    cleanup()
  })

  it('does not offer setup actions for explicitly disabled capabilities', () => {
    const { container, cleanup } = renderDashboard({
      capabilities: { temperature: false, ph: false, ato: false, equipment: false },
      equipment: [],
      temperatureControllers: [],
      phProbes: [],
      atos: []
    })

    expect(container.querySelector('[data-testid="dashboard-setup"]')).toBeNull()
    expect(container.querySelector('[data-testid^="dashboard-tile-"]')).toBeNull()
    expect(container.querySelector('[data-testid="equipment-strip"]')).toBeNull()

    cleanup()
  })
})
