import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let mockAlerts = []
jest.mock('../hooks/useAlertsStore', () => ({
  useAlertsStore: () => ({ alerts: mockAlerts })
}))

import DashboardV2 from './DashboardV2'
import AtoTile from './AtoTile'
import EquipmentStrip from './EquipmentStrip'
import PhTile from './PhTile'
import SystemStrip from './SystemStrip'
import TemperatureTile from './TemperatureTile'

describe('design-system DashboardV2', () => {
  beforeEach(() => {
    mockAlerts = []
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
    const tree = DashboardV2({
      equipment,
      onToggle,
      sseEndpoint: '/api/alerts',
      globalRange: '7d',
      targetAtoLevel: 50,
      children: <span>Legacy dashboard</span>
    })

    const rows = tree.props.children
    expect(tree.props['data-testid']).toBe('smoke-dashboard-v2')
    expect(rows[0].type).toBe(SystemStrip)
    expect(rows[0].props.sseEndpoint).toBe('/api/alerts')
    expect(rows[1].props.children[0].props.children.type).toBe(TemperatureTile)
    expect(rows[1].props.children[0].props.children.props.globalRange).toBe('7d')
    expect(rows[1].props.children[1].props.children.type).toBe(PhTile)
    expect(rows[2].props.children.props.children.type).toBe(AtoTile)
    expect(rows[2].props.children.props.children.props.targetLevel).toBe(50)
    expect(rows[3].type).toBe(EquipmentStrip)
    expect(rows[3].props.items).toBe(equipment)
    expect(rows[3].props.onToggle).toBe(onToggle)
  })

  it('maps unacknowledged alert-center messages to matching tiles', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    mockAlerts = [
      { title: 'Temperature high', detail: 'Water temperature exceeded limit', severity: 'critical', ts: 101 },
      { title: 'pH warning', detail: '', severity: 'warn', ts: 102 },
      { title: 'ATO reservoir', detail: 'Water level low', severity: 'warn', ts: 103 },
      { title: 'Temperature old', detail: 'acknowledged alert', severity: 'critical', ts: 104, acknowledged: true }
    ]

    const tree = DashboardV2({ equipment: [], sseEndpoint: '/api/alerts' })
    const rows = tree.props.children

    expect(rows[1].props.children[0].props.children.props.alert).toEqual({
      severity: 'critical',
      message: 'Water temperature exceeded limit',
      at: 101
    })
    expect(rows[1].props.children[1].props.children.props.alert).toEqual({
      severity: 'warn',
      message: 'pH warning',
      at: 102
    })
    expect(rows[2].props.children.props.children.props.alert).toEqual({
      severity: 'warn',
      message: 'Water level low',
      at: 103
    })
  })

  it('leaves tile alerts unset when no alert keywords match', () => {
    window.FEATURE_FLAGS = { dashboard_v2: true }
    mockAlerts = [
      { title: 'Camera offline', detail: 'No recent images', severity: 'critical', ts: 105 }
    ]

    const rows = DashboardV2({ equipment: [] }).props.children

    expect(rows[1].props.children[0].props.children.props.alert).toBeUndefined()
    expect(rows[1].props.children[1].props.children.props.alert).toBeUndefined()
    expect(rows[2].props.children.props.children.props.alert).toBeUndefined()
  })
})
