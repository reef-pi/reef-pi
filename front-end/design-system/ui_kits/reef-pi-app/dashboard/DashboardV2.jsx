import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import SystemStrip from './SystemStrip'
import { AlertCenter } from './AlertCenter'
import TemperatureTile from './TemperatureTile'
import PhTile from './PhTile'
import AtoTile from './AtoTile'
import EquipmentStrip from './EquipmentStrip'
import SetupPanel from './SetupPanel'
import { useAlertsStore } from '../hooks/useAlertsStore'
import i18n from 'utils/i18n'

/* Composed dashboard layout for the reef-pi overview. */

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

const DASHBOARD_CONFIG_KEY = 'dashboard_config'

const RESOURCE_META = {
  temperature: {
    aliases: ['temperature', 'temperatures', 'tcs', 'temp', 'temp_current', 'temp_historical'],
    href: '/temperature'
  },
  ph: {
    aliases: ['ph', 'phprobes', 'ph_current', 'ph_historical', 'ph_usage'],
    href: '/ph'
  },
  ato: {
    aliases: ['ato', 'atos'],
    href: '/ato'
  },
  equipment: {
    aliases: ['equipment'],
    href: '/equipment'
  }
}

function readDashboardConfig () {
  try {
    const raw = window.localStorage?.getItem(DASHBOARD_CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function writeDashboardConfig (config) {
  try {
    window.localStorage?.setItem(DASHBOARD_CONFIG_KEY, JSON.stringify(config))
  } catch (_) {}
}

function removeDashboardConfig () {
  try { window.localStorage?.removeItem(DASHBOARD_CONFIG_KEY) } catch (_) {}
}

function normalizeResource (value) {
  const v = String(value || '').toLowerCase()
  return Object.keys(RESOURCE_META).find(resource => RESOURCE_META[resource].aliases.includes(v)) || v
}

function subscriptionFor (config, resource) {
  if (!config || typeof config !== 'object') return null
  const subscriptions = Array.isArray(config.subscriptions) ? config.subscriptions : []
  const match = subscriptions.find(item => normalizeResource(item.resource || item.type || item.kind || item.metric) === resource)
  if (match) return match
  const direct = config[resource] || config.charts?.[resource]
  return direct && typeof direct === 'object' ? direct : null
}

function idExists (items, id) {
  return (items || []).some(item => String(item.id) === String(id))
}

function tileStateFor (config, resource, items) {
  const subscription = subscriptionFor(config, resource)
  if (!subscription || subscription.id == null || subscription.id === '') {
    return { configured: (items || []).length > 0, orphan: null }
  }
  if (idExists(items, subscription.id)) {
    return { configured: true, orphan: null }
  }
  return { configured: false, orphan: { resource, id: String(subscription.id) } }
}

function pruneDashboardConfig (config, orphans) {
  if (!config || !orphans.length) return { config, changed: false }
  const orphaned = new Set(orphans.map(item => `${item.resource}:${item.id}`))
  let changed = false
  const next = { ...config }

  if (Array.isArray(config.subscriptions)) {
    next.subscriptions = config.subscriptions.filter(item => {
      const key = `${normalizeResource(item.resource || item.type || item.kind || item.metric)}:${String(item.id)}`
      const keep = !orphaned.has(key)
      if (!keep) changed = true
      return keep
    })
  }

  Object.keys(RESOURCE_META).forEach(resource => {
    const direct = next[resource]
    if (direct && direct.id != null && orphaned.has(`${resource}:${String(direct.id)}`)) {
      delete next[resource]
      changed = true
    }
    const chart = next.charts?.[resource]
    if (chart && chart.id != null && orphaned.has(`${resource}:${String(chart.id)}`)) {
      next.charts = { ...next.charts }
      delete next.charts[resource]
      changed = true
    }
  })

  return { config: next, changed }
}

function setupItem (resource) {
  return {
    id: resource,
    title: i18n.t(`dashboard:setup_${resource}`, { defaultValue: `Set up ${resource}` }),
    description: i18n.t(`dashboard:setup_${resource}_description`, { defaultValue: `Configure ${resource} to show it on the dashboard.` }),
    href: RESOURCE_META[resource].href
  }
}

export default function DashboardV2 ({
  equipment,
  capabilities,
  temperatureControllers,
  phProbes,
  atos,
  onToggle,
  refreshEquipment,
  onConfigure,
  sseEndpoint,
  globalRange,
  targetAtoLevel
}) {
  const { alerts } = useAlertsStore({ sseEndpoint })
  const [configRevision, setConfigRevision] = useState(0)
  const [alertCenterOpen, setAlertCenterOpen] = useState(false)

  const dashboardConfig = useMemo(() => readDashboardConfig(), [configRevision])
  const tempState = tileStateFor(dashboardConfig, 'temperature', temperatureControllers)
  const phState = tileStateFor(dashboardConfig, 'ph', phProbes)
  const atoState = tileStateFor(dashboardConfig, 'ato', atos)
  const orphans = [tempState.orphan, phState.orphan, atoState.orphan].filter(Boolean)

  useEffect(() => {
    const result = pruneDashboardConfig(dashboardConfig, orphans)
    if (result.changed) {
      writeDashboardConfig(result.config)
      setConfigRevision(v => v + 1)
    }
  }, [dashboardConfig, orphans])

  const handleResetDashboardConfig = () => {
    removeDashboardConfig()
    setConfigRevision(v => v + 1)
  }

  const activeAlerts = alerts.filter(alert => !alert.acknowledged)

  const tempAlert = toTileAlert(firstAlertFor(activeAlerts, 'temperature.display'))
  const phAlert = toTileAlert(firstAlertFor(activeAlerts, 'ph.display'))
  const atoAlert = toTileAlert(firstAlertFor(activeAlerts, 'ato.reservoir'))
  const enabled = resource => capabilities?.[resource] !== false
  const setupItems = [
    !tempState.configured && enabled('temperature') ? setupItem('temperature') : null,
    !phState.configured && enabled('ph') ? setupItem('ph') : null,
    !atoState.configured && enabled('ato') ? setupItem('ato') : null,
    !(equipment || []).length && enabled('equipment') ? setupItem('equipment') : null
  ].filter(Boolean)

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
        onResetDashboardConfig={handleResetDashboardConfig}
      />
      <AlertCenter open={alertCenterOpen} onClose={() => setAlertCenterOpen(false)} />
      <SetupPanel items={setupItems} />

      {/* Primary metric row */}
      {(tempState.configured || phState.configured) && (
        <div className='row' style={{ margin: 0, gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
          {tempState.configured && (
            <div style={{ flex: '2 1 300px', minWidth: 0 }}>
              <div data-testid='dashboard-tile-temperature'><TemperatureTile globalRange={globalRange} label={temperatureControllers?.[0]?.name} alert={tempAlert} refreshEquipment={refreshEquipment} /></div>
            </div>
          )}
          {phState.configured && (
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <div data-testid='dashboard-tile-ph'><PhTile globalRange={globalRange} alert={phAlert} /></div>
            </div>
          )}
        </div>
      )}

      {/* Secondary metric row */}
      {atoState.configured && (
        <div className='row' style={{ margin: 0 }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div data-testid='dashboard-tile-ato'><AtoTile globalRange={globalRange} targetLevel={targetAtoLevel} alert={atoAlert} /></div>
          </div>
        </div>
      )}

      {/* Equipment strip — full width footer */}
      {(equipment || []).length > 0 && <EquipmentStrip items={equipment} onToggle={onToggle} />}
    </div>
  )
}

DashboardV2.propTypes = {
  equipment: PropTypes.array,
  capabilities: PropTypes.shape({
    temperature: PropTypes.bool,
    ph: PropTypes.bool,
    ato: PropTypes.bool,
    equipment: PropTypes.bool
  }),
  temperatureControllers: PropTypes.array,
  phProbes: PropTypes.array,
  atos: PropTypes.array,
  onToggle: PropTypes.func,
  refreshEquipment: PropTypes.func,
  onConfigure: PropTypes.func,
  sseEndpoint: PropTypes.string,
  globalRange: PropTypes.string,
  targetAtoLevel: PropTypes.number
}
