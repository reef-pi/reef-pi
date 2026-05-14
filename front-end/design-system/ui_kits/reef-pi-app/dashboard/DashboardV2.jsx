import React, { useState } from 'react'
import PropTypes from 'prop-types'
import SystemStrip from './SystemStrip'
import TemperatureTile from './TemperatureTile'
import PhTile from './PhTile'
import AtoTile from './AtoTile'
import EquipmentStrip from './EquipmentStrip'

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

export default function DashboardV2 ({
  equipment,
  onToggle,
  sseEndpoint,
  globalRange,
  targetAtoLevel,
  children
}) {
  if (!window.FEATURE_FLAGS?.dashboard_v2) {
    return children ?? null
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      padding: '1rem',
      fontFamily: 'var(--reefpi-font-app)'
    }}>
      {/* System strip — full width */}
      <SystemStrip sseEndpoint={sseEndpoint} />

      {/* Primary metric row */}
      <div className='row' style={{ margin: 0, gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 300px', minWidth: 0 }}>
          <TemperatureTile globalRange={globalRange} />
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <PhTile globalRange={globalRange} />
        </div>
      </div>

      {/* Secondary metric row */}
      <div className='row' style={{ margin: 0 }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <AtoTile globalRange={globalRange} targetLevel={targetAtoLevel} />
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
