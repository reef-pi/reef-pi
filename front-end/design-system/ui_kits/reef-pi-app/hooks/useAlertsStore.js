import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Lightweight event-emitter store — no zustand dependency.
 * Shared across all consumers via module-level state.
 *
 * Shape of an alert object:
 *   { id, severity: 'warn'|'critical', title, detail, ts, acknowledged }
 *
 * SSE: subscribes to /api/alerts?since=<cursor> when mount() is called.
 * Consumers that only need to read/dispatch can import dispatchAlert directly.
 */

let _alerts = []
let _cursor = 0
let _listeners = []
let _evtSource = null

function notify () {
  _listeners.forEach(fn => fn([..._alerts]))
}

export function dispatchAlert (alert) {
  const item = {
    id: alert.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    severity: alert.severity ?? 'warn',
    title: alert.title ?? alert.message ?? 'Alert',
    detail: alert.detail ?? alert.message ?? '',
    ts: alert.ts ?? Date.now(),
    acknowledged: false
  }
  _alerts = [item, ..._alerts]
  notify()
}

export function acknowledgeAlert (id) {
  _alerts = _alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  notify()
}

export function dismissAlert (id) {
  _alerts = _alerts.filter(a => a.id !== id)
  notify()
}

export function clearAlerts () {
  _alerts = []
  notify()
}

// ── SSE subscription ─────────────────────────────────────────────────────────

function connectSSE (endpoint) {
  if (_evtSource) return
  try {
    _evtSource = new EventSource(endpoint)
    _evtSource.addEventListener('alert', e => {
      try {
        const data = JSON.parse(e.data)
        dispatchAlert(data)
        _cursor = data.ts ?? _cursor
      } catch {}
    })
    _evtSource.onerror = () => {
      _evtSource?.close()
      _evtSource = null
      // Reconnect after 5 s
      setTimeout(() => connectSSE(endpoint), 5000)
    }
  } catch {
    // EventSource unavailable (SSR / test env) — no-op
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAlertsStore ({ sseEndpoint } = {}) {
  const [alerts, setAlerts] = useState([..._alerts])
  const endpointRef = useRef(sseEndpoint)

  useEffect(() => {
    const fn = updated => setAlerts(updated)
    _listeners.push(fn)
    if (endpointRef.current) {
      connectSSE(`${endpointRef.current}?since=${_cursor}`)
    }
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  }, [])

  const unacked = alerts.filter(a => !a.acknowledged).length

  return {
    alerts,
    unacknowledgedCount: unacked,
    dispatch: dispatchAlert,
    acknowledge: useCallback(id => acknowledgeAlert(id), []),
    dismiss: useCallback(id => dismissAlert(id), []),
    clear: clearAlerts
  }
}
