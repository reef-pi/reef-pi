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


describe('design-system DashboardV2', () => {
  beforeEach(() => {
    mockAlerts = []
  })

  it('renders the system strip, then the configured content, then the equipment strip', () => {
    const onToggle = jest.fn()
    const equipment = [{ id: 'pump', name: 'Pump', state: 'on' }]
    const { container, cleanup } = renderDashboard({
      equipment,
      onToggle,
      sseEndpoint: '/api/alerts',
      children: <section data-testid='configured-grid' />
    })

    const dashboard = container.querySelector('[data-testid="smoke-dashboard-v2"]')
    expect(dashboard).not.toBeNull()
    expect(container.querySelector('[data-testid="system-strip"]').getAttribute('data-sse-endpoint')).toBe('/api/alerts')
    expect(container.querySelector('[data-testid="equipment-strip"]').getAttribute('data-items')).toBe('1')
    expect(container.querySelector('[data-testid="equipment-strip"]').getAttribute('data-toggle')).toBe('yes')

    const order = Array.from(dashboard.querySelectorAll('[data-testid="system-strip"], [data-testid="configured-grid"], [data-testid="equipment-strip"]'))
      .map(node => node.getAttribute('data-testid'))
    expect(order).toEqual(['system-strip', 'configured-grid', 'equipment-strip'])

    cleanup()
  })

  it('does not render fixed temperature, pH or ATO tiles of its own', () => {
    const { container, cleanup } = renderDashboard({ equipment: [] })
    expect(container.querySelector('[data-testid^="dashboard-tile-"]')).toBeNull()
    cleanup()
  })

  it('passes active alerts into the system strip and opens the alert center from the strip', () => {
    mockAlerts = [
      { id: '1', title: 'Temperature high', detail: 'Water temperature exceeded limit', severity: 'critical', ts: 101 },
      { id: '2', title: 'Old alert', detail: 'Already handled', severity: 'warn', ts: 102, acknowledged: true }
    ]

    const { container, cleanup } = renderDashboard({
      equipment: [],
      sseEndpoint: '/api/alerts'
    })

    expect(JSON.parse(container.querySelector('[data-testid="system-strip"]').getAttribute('data-alerts'))).toEqual([mockAlerts[0]])
    expect(container.querySelector('[data-testid="alert-center"]').getAttribute('data-open')).toBe('no')

    act(() => container.querySelector('[data-testid="system-strip-alert-trigger"]').click())
    expect(container.querySelector('[data-testid="alert-center"]').getAttribute('data-open')).toBe('yes')
    expect(container.querySelector('#configure-dashboard')).toBeNull()

    cleanup()
  })
})
