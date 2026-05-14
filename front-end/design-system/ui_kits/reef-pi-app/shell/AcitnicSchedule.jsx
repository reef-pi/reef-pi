import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

/*
 * Settings toggle for "Follow reef schedule" actinic auto-switch.
 * When enabled, switches to actinic between sunset/sunrise from the
 * lighting profile (falls back to 21:00–06:00 local time).
 *
 * Works alongside ThemePicker: manual override (ThemePicker) wins for
 * the session. AcitnicSchedule only runs when ThemePicker choice === 'system'
 * or 'actinic'.
 *
 * Usage (in Settings):
 *   <AcitnicSchedule
 *     sunsetHour={21}
 *     sunriseHour={6}
 *     onScheduleChange={active => console.log(active)}
 *   />
 */

const STORAGE_KEY = 'reefpi.actinic-schedule'

function isNightWindow (sunsetHour, sunriseHour) {
  const h = new Date().getHours()
  if (sunsetHour > sunriseHour) return h >= sunsetHour || h < sunriseHour
  return h >= sunsetHour && h < sunriseHour
}

export default function AcitnicSchedule ({
  sunsetHour  = 21,
  sunriseHour = 6,
  onScheduleChange
}) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(enabled)) } catch {}
    onScheduleChange?.(enabled)
    if (!enabled) return

    function applySchedule () {
      const night = isNightWindow(sunsetHour, sunriseHour)
      const html  = document.documentElement
      const cur   = html.getAttribute('data-theme')
      if (night && cur !== 'actinic') {
        html.setAttribute('data-theme', 'actinic')
        html.dispatchEvent(new CustomEvent('reefpi:theme-change', { detail: { theme: 'actinic', source: 'schedule' }, bubbles: true }))
      } else if (!night && cur === 'actinic') {
        html.removeAttribute('data-theme')
        html.dispatchEvent(new CustomEvent('reefpi:theme-change', { detail: { theme: 'light', source: 'schedule' }, bubbles: true }))
      }
    }

    applySchedule()
    const timer = setInterval(applySchedule, 60_000)
    return () => clearInterval(timer)
  }, [enabled, sunsetHour, sunriseHour, onScheduleChange])

  const toggle = () => setEnabled(e => !e)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: 'var(--reefpi-color-surface)',
      border: '1px solid var(--reefpi-color-border)',
      borderRadius: 'var(--reefpi-radius-md)',
      fontFamily: 'var(--reefpi-font-app)'
    }}>
      <div style={{ flex: '1 1 auto' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--reefpi-color-text)' }}>
          Follow reef schedule
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--reefpi-color-text-muted)', marginTop: '2px' }}>
          {`Enable actinic between ${sunsetHour}:00–${sunriseHour}:00`}
        </div>
      </div>
      <button
        role='switch'
        aria-checked={enabled}
        aria-label='Follow reef schedule'
        onClick={toggle}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          lineHeight: 0,
          flexShrink: 0
        }}
      >
        <svg width='44' height='24' viewBox='0 0 44 24' aria-hidden='true'>
          <rect x='0' y='0' width='44' height='24' rx='12'
            fill={enabled ? 'var(--reefpi-color-brand)' : 'var(--reefpi-color-border-strong)'}
            style={{ transition: 'fill 0.2s' }}
          />
          <circle
            cx={enabled ? 32 : 12}
            cy='12' r='10'
            fill='var(--reefpi-color-surface-elevated)'
            stroke='var(--reefpi-color-border)'
            strokeWidth='1'
            style={{ transition: 'cx 0.2s' }}
          />
        </svg>
      </button>
    </div>
  )
}

AcitnicSchedule.propTypes = {
  sunsetHour:       PropTypes.number,
  sunriseHour:      PropTypes.number,
  onScheduleChange: PropTypes.func
}
