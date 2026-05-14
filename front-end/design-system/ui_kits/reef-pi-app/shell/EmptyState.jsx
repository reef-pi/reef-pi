import React from 'react'
import PropTypes from 'prop-types'

/*
 * Shared empty state for every list page.
 * Provides a labeled SVG placeholder, one-line description, and a single CTA.
 *
 * Usage:
 *   <EmptyState
 *     icon={<EquipmentIcon />}
 *     title="No equipment yet"
 *     body="Add your first pump, heater, or skimmer."
 *     action={{ label: 'Add equipment', onClick: () => openModal() }}
 *   />
 */

export default function EmptyState ({ icon, title, body, action }) {
  return (
    <div
      role='status'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        fontFamily: 'var(--reefpi-font-app)'
      }}
    >
      {/* SVG illustration slot */}
      <div style={{
        width: '64px',
        height: '64px',
        marginBottom: '1.25rem',
        color: 'var(--reefpi-color-border-strong)',
        opacity: 0.35
      }}>
        {icon ?? <DefaultIcon />}
      </div>

      <div style={{
        fontSize: '1rem',
        fontWeight: 500,
        color: 'var(--reefpi-color-text)',
        marginBottom: '0.4rem'
      }}>
        {title}
      </div>

      {body && (
        <div style={{
          fontSize: '0.85rem',
          color: 'var(--reefpi-color-text-muted)',
          maxWidth: '28ch',
          lineHeight: 1.5,
          marginBottom: '1.5rem'
        }}>
          {body}
        </div>
      )}

      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: 'var(--reefpi-gradient-brand)',
            border: 'none',
            borderRadius: 'var(--reefpi-radius-sm)',
            color: 'var(--reefpi-color-nav-text-strong)',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--reefpi-font-app)',
            padding: '0 1.25rem',
            minHeight: 'var(--reefpi-tap-target-min)',
            cursor: 'pointer'
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ── Route-specific icon placeholders ─────────────────────────────────────────

function DefaultIcon () {
  return (
    <svg viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <rect x='8' y='16' width='48' height='36' rx='3' />
      <line x1='8' y1='26' x2='56' y2='26' />
      <line x1='24' y1='16' x2='24' y2='26' />
    </svg>
  )
}

export function EquipmentIcon () {
  return (
    <svg viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='32' cy='32' r='10' />
      <path d='M32 8v8M32 48v8M8 32h8M48 32h8M15.5 15.5l5.6 5.6M42.9 42.9l5.6 5.6M15.5 48.5l5.6-5.6M42.9 21.1l5.6-5.6' />
    </svg>
  )
}

export function TimerIcon () {
  return (
    <svg viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='32' cy='36' r='20' />
      <line x1='32' y1='36' x2='32' y2='22' />
      <line x1='32' y1='36' x2='42' y2='36' />
      <line x1='24' y1='10' x2='40' y2='10' />
      <line x1='32' y1='8' x2='32' y2='16' />
    </svg>
  )
}

export function LightingIcon () {
  return (
    <svg viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <circle cx='32' cy='24' r='10' />
      <path d='M26 34l-4 14h20l-4-14H26z' />
      <line x1='28' y1='48' x2='36' y2='48' />
      <line x1='30' y1='52' x2='34' y2='52' />
    </svg>
  )
}

export function DoserIcon () {
  return (
    <svg viewBox='0 0 64 64' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
      <rect x='20' y='8' width='24' height='40' rx='4' />
      <line x1='20' y1='24' x2='44' y2='24' />
      <path d='M32 38v8' />
      <circle cx='32' cy='50' r='4' />
    </svg>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  })
}
