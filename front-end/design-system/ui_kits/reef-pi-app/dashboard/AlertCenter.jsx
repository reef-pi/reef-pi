import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useAlertsStore } from '../hooks/useAlertsStore'

/*
 * Alert center — 380px right-edge slide-over + navbar bell.
 * Behind alert_center flag (wired in E4).
 *
 * Usage:
 *   <AlertCenterBell />         ← mounts bell + slide-over together
 *   <AlertCenter open onClose /> ← controlled, if you need to open externally
 */

const SEVERITY_COLOR = {
  critical: 'var(--reefpi-color-error)',
  warn:     'var(--reefpi-color-warn)'
}

const SEVERITY_BG = {
  critical: 'var(--reefpi-color-error-bg)',
  warn:     'var(--reefpi-color-warn-bg)'
}

function relativeTime (ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Bell ─────────────────────────────────────────────────────────────────────

export function AlertCenterBell ({ sseEndpoint }) {
  const [open, setOpen] = useState(false)
  const { unacknowledgedCount } = useAlertsStore({ sseEndpoint })

  return (
    <>
      <button
        aria-label={`Alerts${unacknowledgedCount ? ` — ${unacknowledgedCount} unacknowledged` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--reefpi-color-nav-text)',
          borderRadius: 'var(--reefpi-radius-sm)'
        }}
      >
        <BellIcon />
        {unacknowledgedCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            minWidth: '16px',
            height: '16px',
            borderRadius: '8px',
            background: 'var(--reefpi-color-error)',
            color: 'var(--reefpi-color-nav-text-strong)',
            fontSize: '0.6rem',
            fontFamily: 'var(--reefpi-font-app)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            pointerEvents: 'none'
          }}>
            {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
          </span>
        )}
      </button>
      <AlertCenter open={open} onClose={() => setOpen(false)} />
    </>
  )
}

// ── Slide-over ────────────────────────────────────────────────────────────────

export function AlertCenter ({ open, onClose }) {
  const { alerts, acknowledge, dismiss } = useAlertsStore()
  const panelRef = useRef(null)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const active   = alerts.filter(a => !a.acknowledged)
  const resolved = alerts.filter(a => a.acknowledged)
  const allRows  = [...active, ...resolved]

  // Esc to close
  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowDown') setFocusedIdx(i => Math.min(i + 1, allRows.length - 1))
      if (e.key === 'ArrowUp')   setFocusedIdx(i => Math.max(i - 1, 0))
      if (e.key === 'a' && allRows[focusedIdx]) acknowledge(allRows[focusedIdx].id)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, allRows, focusedIdx, acknowledge, onClose])

  // Focus trap — return focus on close
  useEffect(() => {
    if (open) { setTimeout(() => panelRef.current?.focus(), 50) }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          aria-hidden='true'
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 200,
            transition: 'opacity 0.2s'
          }}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role='dialog'
        aria-label='Alert center'
        aria-modal='true'
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          maxWidth: '100vw',
          background: 'var(--reefpi-color-surface-elevated)',
          borderLeft: '1px solid var(--reefpi-color-border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.22s cubic-bezier(0.4,0,0.2,1)',
          outline: 'none',
          fontFamily: 'var(--reefpi-font-app)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem', borderBottom: '1px solid var(--reefpi-color-border)',
          flexShrink: 0
        }}>
          <span style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--reefpi-color-text)' }}>
            Alerts
          </span>
          <button
            aria-label='Close alert center'
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--reefpi-color-text-muted)',
              minWidth: '44px', minHeight: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--reefpi-radius-sm)'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '0.5rem 0' }}>
          {allRows.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {active.length > 0 && (
                <SectionHeader label='Active' count={active.length} />
              )}
              {active.map((alert, i) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  focused={allRows.indexOf(alert) === focusedIdx}
                  onAcknowledge={() => acknowledge(alert.id)}
                  onDismiss={() => dismiss(alert.id)}
                />
              ))}
              {resolved.length > 0 && (
                <>
                  <SectionHeader label='Resolved' count={resolved.length} />
                  {resolved.map(alert => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      focused={allRows.indexOf(alert) === focusedIdx}
                      onAcknowledge={() => acknowledge(alert.id)}
                      onDismiss={() => dismiss(alert.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Keyboard hint */}
        <div style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid var(--reefpi-color-border)',
          fontSize: '0.65rem',
          color: 'var(--reefpi-color-text-muted)',
          fontFamily: 'var(--reefpi-font-mono)',
          flexShrink: 0
        }}>
          ↑↓ navigate · a acknowledge · Esc close
        </div>
      </div>
    </>
  )
}

function SectionHeader ({ label, count }) {
  return (
    <div style={{
      padding: '0.5rem 1rem 0.25rem',
      fontSize: '0.65rem', fontWeight: 500,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      color: 'var(--reefpi-color-text-muted)'
    }}>
      {label} ({count})
    </div>
  )
}

function AlertRow ({ alert, focused, onAcknowledge, onDismiss }) {
  const color = SEVERITY_COLOR[alert.severity] ?? 'var(--reefpi-color-text-muted)'
  const bg    = SEVERITY_BG[alert.severity] ?? 'transparent'

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.625rem 1rem',
      background: focused ? bg : 'transparent',
      borderLeft: focused ? `3px solid ${color}` : '3px solid transparent',
      transition: 'background 0.1s',
      opacity: alert.acknowledged ? 0.55 : 1
    }}>
      {/* Severity dot */}
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: color, flexShrink: 0, marginTop: '5px'
      }} />

      {/* Content */}
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--reefpi-color-text)', marginBottom: '1px' }}>
          {alert.title}
        </div>
        {alert.detail && (
          <div style={{
            fontSize: '0.75rem', color: 'var(--reefpi-color-text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {alert.detail}
          </div>
        )}
        <div style={{ fontSize: '0.65rem', color: 'var(--reefpi-color-text-muted)', marginTop: '2px', fontFamily: 'var(--reefpi-font-mono)' }}>
          {relativeTime(alert.ts)}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
        {alert.retry && !alert.acknowledged && (
          <button
            onClick={() => { alert.retry(); onAcknowledge() }}
            style={actionBtnStyle('var(--reefpi-color-pending)')}
          >
            Retry
          </button>
        )}
        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            style={actionBtnStyle('var(--reefpi-color-brand)')}
          >
            Ack
          </button>
        )}
        <button
          onClick={onDismiss}
          style={actionBtnStyle('var(--reefpi-color-text-muted)')}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

function EmptyState () {
  return (
    <div style={{
      padding: '3rem 1.5rem', textAlign: 'center',
      color: 'var(--reefpi-color-text-muted)', fontSize: '0.85rem'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>&#10003;</div>
      No active alerts — all systems nominal.
    </div>
  )
}

const actionBtnStyle = color => ({
  background: 'none',
  border: `1px solid ${color}`,
  borderRadius: 'var(--reefpi-radius-sm)',
  color,
  fontSize: '0.65rem',
  padding: '2px 6px',
  cursor: 'pointer',
  minHeight: '28px',
  fontFamily: 'var(--reefpi-font-app)',
  whiteSpace: 'nowrap'
})

function BellIcon () {
  return (
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <path d='M9 2a5 5 0 0 1 5 5v3l1.5 2H2.5L4 10V7a5 5 0 0 1 5-5z' />
      <path d='M7 15a2 2 0 0 0 4 0' />
    </svg>
  )
}

function CloseIcon () {
  return (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' aria-hidden='true'>
      <line x1='3' y1='3' x2='13' y2='13' /><line x1='13' y1='3' x2='3' y2='13' />
    </svg>
  )
}

AlertCenterBell.propTypes = { sseEndpoint: PropTypes.string }
AlertCenter.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
}
