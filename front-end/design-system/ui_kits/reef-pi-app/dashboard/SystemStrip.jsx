import React from 'react'
import PropTypes from 'prop-types'

if (!window.FEATURE_FLAGS?.dashboard_v2) {
  // Guard: component is a no-op until the dashboard_v2 flag is enabled.
  // Wired in issue #14.
}

/** Derives health pill state from a list of alert objects. */
function healthFromAlerts (alerts) {
  if (!alerts || alerts.length === 0) return 'ok'
  const hasCritical = alerts.some(a => a.severity === 'critical')
  if (hasCritical) return 'critical'
  return 'warn'
}

const PILL_COLORS = {
  ok:       'var(--reefpi-color-brand)',
  warn:     'var(--reefpi-color-warn)',
  critical: 'var(--reefpi-color-error)'
}

export default function SystemStrip ({
  displayName = 'Reef Tank',
  uptimeLabel = '',
  version = '',
  alerts = [],
  onAlertClick,
  onConfigure,
  onSignOut
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef(null)
  const health = healthFromAlerts(alerts)
  const alertCount = alerts.length

  // Close kebab when clicking outside
  React.useEffect(() => {
    if (!menuOpen) return
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [menuOpen])

  return (
    <div
      className='reefpi-system-strip'
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        height: '56px',
        padding: '0 1rem',
        background: 'var(--reefpi-color-surface-elevated)',
        borderBottom: '1px solid var(--reefpi-color-border)',
        fontFamily: 'var(--reefpi-font-app)',
        flexShrink: 0
      }}
    >
      {/* Health pill */}
      <span
        aria-label={`System health: ${health}`}
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: PILL_COLORS[health],
          flexShrink: 0,
          transition: 'background-color 0.2s'
        }}
      />

      {/* Tank name */}
      <span style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--reefpi-color-text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: '1 1 auto',
        minWidth: 0
      }}>
        {displayName}
      </span>

      {/* Uptime + version (hidden on very narrow viewports via flex shrink) */}
      {(uptimeLabel || version) && (
        <span style={{
          fontSize: '0.72rem',
          color: 'var(--reefpi-color-text-muted)',
          whiteSpace: 'nowrap',
          flexShrink: 1,
          overflow: 'hidden'
        }}>
          {[uptimeLabel, version].filter(Boolean).join(' · ')}
        </span>
      )}

      {/* Alert count badge */}
      {alertCount > 0 && (
        <button
          onClick={onAlertClick}
          aria-label={`${alertCount} alert${alertCount !== 1 ? 's' : ''} — open alert center`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: health === 'critical'
              ? 'var(--reefpi-color-error-bg)'
              : 'var(--reefpi-color-warn-bg)',
            border: `1px solid ${health === 'critical'
              ? 'var(--reefpi-color-error-border)'
              : 'var(--reefpi-color-warn)'}`,
            borderRadius: 'var(--reefpi-radius-sm)',
            color: health === 'critical'
              ? 'var(--reefpi-color-error)'
              : 'var(--reefpi-color-warn)',
            fontSize: '0.72rem',
            fontFamily: 'var(--reefpi-font-app)',
            padding: '2px 8px',
            cursor: 'pointer',
            minHeight: '28px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'currentColor', flexShrink: 0
          }} />
          {alertCount} alert{alertCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Kebab menu */}
      <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
        <button
          aria-label='System menu'
          aria-expanded={menuOpen}
          aria-haspopup='true'
          onClick={() => setMenuOpen(o => !o)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 8px',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--reefpi-radius-sm)',
            color: 'var(--reefpi-color-text-muted)'
          }}
        >
          <svg width='4' height='16' viewBox='0 0 4 16' fill='currentColor' aria-hidden='true'>
            <circle cx='2' cy='2'  r='1.5' />
            <circle cx='2' cy='8'  r='1.5' />
            <circle cx='2' cy='14' r='1.5' />
          </svg>
        </button>

        {menuOpen && (
          <div
            role='menu'
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              background: 'var(--reefpi-color-surface-elevated)',
              border: '1px solid var(--reefpi-color-border)',
              borderRadius: 'var(--reefpi-radius-md)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              minWidth: '140px',
              overflow: 'hidden'
            }}
          >
            <button
              role='menuitem'
              onClick={() => { setMenuOpen(false); onConfigure?.() }}
              style={menuItemStyle}
            >
              Configure
            </button>
            <button
              role='menuitem'
              onClick={() => { setMenuOpen(false); onSignOut?.() }}
              style={{ ...menuItemStyle, color: 'var(--reefpi-color-error)', borderTop: '1px solid var(--reefpi-color-border)' }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 1rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.875rem',
  color: 'var(--reefpi-color-text)',
  textAlign: 'left',
  minHeight: '44px'
}

SystemStrip.propTypes = {
  displayName: PropTypes.string,
  uptimeLabel: PropTypes.string,
  version: PropTypes.string,
  alerts: PropTypes.arrayOf(PropTypes.shape({
    severity: PropTypes.oneOf(['warn', 'critical'])
  })),
  onAlertClick: PropTypes.func,
  onConfigure: PropTypes.func,
  onSignOut: PropTypes.func
}
