import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

/*
 * Confirms the user is signing into the right controller.
 * Fetched from unauthenticated GET /api/meta.
 * Hides silently on fetch failure — never shows an error banner.
 *
 * Usage (below the sign-in form):
 *   <SignInConfidenceCard endpoint='/api/meta' />
 */

function formatUptime (seconds) {
  if (!seconds) return null
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  if (d > 0) return `up ${d}d ${h}h`
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `up ${h}h ${m}m` : `up ${m}m`
}

export default function SignInConfidenceCard ({ endpoint = '/api/meta' }) {
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(endpoint)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data) setMeta(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [endpoint])

  if (!meta) return null

  const uptime = formatUptime(meta.uptime)

  return (
    <footer
      aria-label='Controller info'
      style={{
        marginTop: '1.25rem',
        padding: '0.75rem 1rem',
        background: 'var(--reefpi-color-surface)',
        border: '1px solid var(--reefpi-color-border)',
        borderRadius: 'var(--reefpi-radius-md)',
        textAlign: 'center',
        fontFamily: 'var(--reefpi-font-app)'
      }}
    >
      {meta.name && (
        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--reefpi-color-text)', marginBottom: '0.2rem' }}>
          {meta.name}
        </div>
      )}
      <div style={{ fontSize: '0.72rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)' }}>
        {[meta.ip, meta.version].filter(Boolean).join(' · ')}
      </div>
      {(meta.device || uptime) && (
        <div style={{ fontSize: '0.72rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)', marginTop: '0.1rem' }}>
          {[meta.device, uptime].filter(Boolean).join(' · ')}
        </div>
      )}
    </footer>
  )
}

SignInConfidenceCard.propTypes = {
  endpoint: PropTypes.string
}
