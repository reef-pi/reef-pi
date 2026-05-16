import React from 'react'
import PropTypes from 'prop-types'
import SystemStrip from './SystemStrip'
import TemperatureTile from './TemperatureTile'
import PhTile from './PhTile'
import AtoTile from './AtoTile'
import EquipmentStrip from './EquipmentStrip'
import { useAlertsStore } from '../hooks/useAlertsStore'

/*
 * Composed dashboard layout for the dashboard_v2 flag.
 *
 * Usage (in the host app):
 *   <DashboardV2 equipment={items} onToggle={fn} sseEndpoint="/api/alerts">
 *     <LegacyDashboard />   ← rendered when flag is off
 *   </DashboardV2>
 *
 * The component self-guards: when window.FEATURE_FLAGS?.dashboard_v2 is falsy
 * it renders children (the original dashboard) unchanged.
 *
 * Removal ticket: schedule for 2 releases after QA sign-off (flag flipped to true).
 */

// Maps tile metric keys → alert store title keywords for matching
const METRIC_KEYWORDS = {
  'temperature.display': ['temperature', 'temp'],
  'ph.display': ['ph'],
  'ato.reservoir': ['ato', 'reservoir', 'water level']
}

function firstAlertFor (alerts, metric) {
  const keys = METRIC_KEYWORDS[metric] ?? []
  return alerts.find(a =>
    !a.acknowledged &&
    keys.some(k => {
      const haystack = ((a.title ?? '') + ' ' + (a.detail ?? '')).toLowerCase()
      return haystack.includes(k)
    })
  ) ?? null
}

function toTileAlert (a) {
  if (!a) return undefined
  return { severity: a.severity, message: a.detail || a.title, at: a.ts }
}

export default function DashboardV2 ({
  equipment,
  onToggle,
  sseEndpoint,
  globalRange,
  targetAtoLevel,
  children
}) {
  const { alerts } = useAlertsStore({ sseEndpoint })

  if (!window.FEATURE_FLAGS?.dashboard_v2) {
    return children ?? null
  }

  const tempAlert = toTileAlert(firstAlertFor(alerts, 'temperature.display'))
  const phAlert = toTileAlert(firstAlertFor(alerts, 'ph.display'))
  const atoAlert = toTileAlert(firstAlertFor(alerts, 'ato.reservoir'))

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem',
      fontFamily: 'var(--reefpi-font-app)'
    }}
    data-testid='smoke-dashboard-v2'
    >
      {/* System strip — full width */}
      <SystemStrip sseEndpoint={sseEndpoint} />

      {/* Primary metric row */}
      <div className='row' style={{ margin: 0, gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 300px', minWidth: 0 }}>
          <TemperatureTile globalRange={globalRange} alert={tempAlert} />
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <PhTile globalRange={globalRange} alert={phAlert} />
        </div>
      </div>

      {/* Secondary metric row */}
      <div className='row' style={{ margin: 0 }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <AtoTile globalRange={globalRange} targetLevel={targetAtoLevel} alert={atoAlert} />
        </div>
      </div>

      {/* Equipment strip — full width footer */}
      <EquipmentStrip items={equipment} onToggle={onToggle} />
    </div>
  )
}

DashboardV2.propTypes = {
  equipment: PropTypes.array,
  onToggle: PropTypes.func,
  sseEndpoint: PropTypes.string,
  globalRange: PropTypes.string,
  targetAtoLevel: PropTypes.number,
  children: PropTypes.node
}
