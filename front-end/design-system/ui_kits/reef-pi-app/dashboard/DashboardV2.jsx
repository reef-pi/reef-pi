import React, { useState } from 'react'
import PropTypes from 'prop-types'
import SystemStrip from './SystemStrip'
import { AlertCenter } from './AlertCenter'
import EquipmentStrip from './EquipmentStrip'
import { useAlertsStore } from '../hooks/useAlertsStore'

/*
 * Composed dashboard layout for the reef-pi overview: system strip on top, the host's
 * content (the grid configured under Dashboard › Configure) in the middle, and the
 * equipment strip along the bottom.
 */
export default function DashboardV2 ({
  equipment,
  onToggle,
  onConfigure,
  sseEndpoint,
  children
}) {
  const { alerts } = useAlertsStore({ sseEndpoint })
  const [alertCenterOpen, setAlertCenterOpen] = useState(false)

  const activeAlerts = alerts.filter(alert => !alert.acknowledged)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        fontFamily: 'var(--reefpi-font-app)'
      }}
      data-testid='smoke-dashboard-v2'
    >
      {/* System strip — full width */}
      <SystemStrip
        sseEndpoint={sseEndpoint}
        alerts={activeAlerts}
        onAlertClick={() => setAlertCenterOpen(true)}
        onConfigure={onConfigure}
      />
      <AlertCenter open={alertCenterOpen} onClose={() => setAlertCenterOpen(false)} />

      {children}

      {/* Equipment strip — full width footer */}
      <EquipmentStrip items={equipment} onToggle={onToggle} />
    </div>
  )
}

DashboardV2.propTypes = {
  equipment: PropTypes.array,
  onToggle: PropTypes.func,
  onConfigure: PropTypes.func,
  sseEndpoint: PropTypes.string,
  children: PropTypes.node
}
