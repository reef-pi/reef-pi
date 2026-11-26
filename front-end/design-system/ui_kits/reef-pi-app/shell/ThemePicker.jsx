import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '../hooks/useTheme'

/*
 * Appearance section for Configuration › Settings.
 * Radios: System / Light / Dark / Actinic / Classic, each with a swatch that previews the
 * theme by scoping its tokens (data-theme on the swatch itself).
 * Writes <html data-theme>, localStorage, fires reefpi:theme-change.
 */

const OPTIONS = [
  { value: 'system', label: 'System', desc: 'Follow device preference' },
  { value: 'light', label: 'Light', desc: 'Always light' },
  { value: 'dark', label: 'Dark', desc: 'Low-light general mode' },
  { value: 'actinic', label: 'Actinic', desc: 'Reef blue night mode' },
  { value: 'classic', label: 'Classic', desc: 'Original reef-pi green' }
]

// Canvas, panel and action colour of one theme, read from that theme's own tokens.
function Swatch ({ theme }) {
  return (
    <span
      data-theme={theme}
      aria-hidden='true'
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '3px',
        borderRadius: 'var(--reefpi-radius-sm)',
        background: 'var(--reefpi-color-surface)',
        border: '1px solid var(--reefpi-color-border)'
      }}
    >
      <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--reefpi-color-surface-elevated)', border: '1px solid var(--reefpi-color-border)' }} />
      <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--reefpi-color-brand)' }} />
    </span>
  )
}

Swatch.propTypes = { theme: PropTypes.string.isRequired }

export default function ThemePicker ({ onSessionOverride } = {}) {
  const { theme, setTheme } = useTheme()

  const handleChange = value => {
    setTheme(value)
    onSessionOverride?.(value)
  }

  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0, fontFamily: 'var(--reefpi-font-app)' }}>
      <legend className='reefpi-section-title' style={{ padding: 0 }}>
        Appearance
      </legend>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: 'var(--reefpi-space-sm)' }}>
        {OPTIONS.map(opt => {
          const selected = theme === opt.value
          return (
            <label
              key={opt.value}
              data-selected={selected || undefined}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--reefpi-space-xs)',
                minHeight: 'var(--reefpi-tap-target-min)',
                padding: 'var(--reefpi-space-sm)',
                borderRadius: 'var(--reefpi-radius-sm)',
                cursor: 'pointer',
                background: selected
                  ? 'color-mix(in srgb, var(--reefpi-color-brand) 8%, var(--reefpi-color-surface-elevated))'
                  : 'var(--reefpi-color-surface-elevated)',
                border: selected
                  ? '1px solid var(--reefpi-color-brand)'
                  : '1px solid var(--reefpi-color-border)',
                transition: 'background-color 120ms ease, border-color 120ms ease'
              }}
            >
              <input
                type='radio'
                name='reefpi-theme'
                value={opt.value}
                checked={selected}
                onChange={() => handleChange(opt.value)}
                style={{ marginTop: '0.125rem' }}
              />
              <span style={{ display: 'grid', gap: '0.125rem', flex: '1 1 auto' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--reefpi-color-text)' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--reefpi-color-text-muted)' }}>
                  {opt.desc}
                </span>
              </span>
              <span style={{ display: 'inline-flex', gap: '2px', flexShrink: 0 }}>
                {opt.value === 'system'
                  ? <><Swatch theme='light' /><Swatch theme='dark' /></>
                  : <Swatch theme={opt.value} />}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

ThemePicker.propTypes = {
  onSessionOverride: PropTypes.func
}
