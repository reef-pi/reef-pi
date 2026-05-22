import React, { useEffect, useMemo, useState } from 'react'
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

const DASHBOARD_CONFIG_KEY = 'dashboard_config'

const RESOURCE_META = {
  temperature: {
    aliases: ['temperature', 'temperatures', 'tcs', 'temp', 'temp_current', 'temp_historical'],
    title: 'Temperature',
    copy: 'No temperature probe is selected for this chart.',
    action: 'Configure temperature probe',
    href: '/temperature'
  },
  ph: {
    aliases: ['ph', 'phprobes', 'ph_current', 'ph_historical', 'ph_usage'],
    title: 'pH',
    copy: 'No pH probe is selected for this chart.',
    action: 'Configure pH probe',
    href: '/ph'
  },
  ato: {
    aliases: ['ato', 'atos'],
    title: 'ATO',
    copy: 'No ATO controller is selected for this chart.',
    action: 'Configure ATO',
    href: '/ato'
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

function NotConfiguredTile ({ resource }) {
  const meta = RESOURCE_META[resource]
  return (
    <div
      data-testid={`dashboard-tile-${resource}`}
      style={{
        background: 'var(--reefpi-color-surface-elevated)',
        border: '1px solid var(--reefpi-color-border)',
        borderRadius: 'var(--reefpi-radius-md)',
        minHeight: resource === 'temperature' ? '320px' : '220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1rem',
        textAlign: 'center',
        fontFamily: 'var(--reefpi-font-app)'
      }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--reefpi-color-text-muted)' }}>
        {meta.title}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--reefpi-color-text)' }}>Not configured</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--reefpi-color-text-muted)', maxWidth: '18rem' }}>{meta.copy}</div>
      <a
        href={meta.href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '44px',
          padding: '0 1rem',
          borderRadius: 'var(--reefpi-radius-sm)',
          background: 'var(--reefpi-color-brand)',
          color: 'var(--reefpi-color-on-brand, #fff)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        {meta.action}
      </a>
    </div>
  )
}

NotConfiguredTile.propTypes = {
  resource: PropTypes.oneOf(Object.keys(RESOURCE_META)).isRequired
}

export default function DashboardV2 ({
  equipment,
  temperatureControllers,
  phProbes,
  atos,
  onToggle,
  onConfigure,
  sseEndpoint,
  globalRange,
  targetAtoLevel,
  children
}) {
  const { alerts } = useAlertsStore({ sseEndpoint })
  const [configRevision, setConfigRevision] = useState(0)

  if (!window.FEATURE_FLAGS?.dashboard_v2) {
    return children ?? null
  }

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

  const tempAlert = toTileAlert(firstAlertFor(alerts, 'temperature.display'))
  const phAlert = toTileAlert(firstAlertFor(alerts, 'ph.display'))
  const atoAlert = toTileAlert(firstAlertFor(alerts, 'ato.reservoir'))

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
        onConfigure={onConfigure}
        onResetDashboardConfig={handleResetDashboardConfig}
      />

      {/* Primary metric row */}
      <div className='row' style={{ margin: 0, gap: '1rem', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 300px', minWidth: 0 }}>
          {tempState.configured
            ? <div data-testid='dashboard-tile-temperature'><TemperatureTile globalRange={globalRange} alert={tempAlert} /></div>
            : <NotConfiguredTile resource='temperature' />}
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          {phState.configured
            ? <div data-testid='dashboard-tile-ph'><PhTile globalRange={globalRange} alert={phAlert} /></div>
            : <NotConfiguredTile resource='ph' />}
        </div>
      </div>

      {/* Secondary metric row */}
      <div className='row' style={{ margin: 0 }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          {atoState.configured
            ? <div data-testid='dashboard-tile-ato'><AtoTile globalRange={globalRange} targetLevel={targetAtoLevel} alert={atoAlert} /></div>
            : <NotConfiguredTile resource='ato' />}
        </div>
      </div>

      {/* Equipment strip — full width footer */}
      <EquipmentStrip items={equipment} onToggle={onToggle} />
    </div>
  )
}

DashboardV2.propTypes = {
  equipment: PropTypes.array,
  temperatureControllers: PropTypes.array,
  phProbes: PropTypes.array,
  atos: PropTypes.array,
  onToggle: PropTypes.func,
  onConfigure: PropTypes.func,
  sseEndpoint: PropTypes.string,
  globalRange: PropTypes.string,
  targetAtoLevel: PropTypes.number,
  children: PropTypes.node
}
