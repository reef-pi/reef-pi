import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '../hooks/useTheme'

/*
 * Appearance section for Configuration › Settings.
 * Radios: Light / Dark / Actinic / System.
 * Writes <html data-theme>, localStorage, fires reefpi:theme-change.
 */

const OPTIONS = [
  { value: 'system',   label: 'System',   desc: 'Follow device preference' },
  { value: 'light',    label: 'Light',    desc: 'Always light'             },
  { value: 'dark',     label: 'Dark',     desc: 'Low-light general mode'   },
  { value: 'actinic',  label: 'Actinic',  desc: 'Reef blue night mode'     }
]

export default function ThemePicker ({ onSessionOverride } = {}) {
  const { theme, setTheme } = useTheme()

  const handleChange = value => {
    setTheme(value)
    onSessionOverride?.(value)
  }

  return (
    <fieldset style={{
      border: '1px solid var(--reefpi-color-border)',
      borderRadius: 'var(--reefpi-radius-md)',
      padding: '1rem',
      fontFamily: 'var(--reefpi-font-app)'
    }}>
      <legend style={{
        fontSize: '0.75rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--reefpi-color-text-muted)',
        padding: '0 0.25rem'
      }}>
        Appearance
      </legend>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {OPTIONS.map(opt => (
          <label
            key={opt.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minHeight: 'var(--reefpi-tap-target-min)',
              padding: '0 0.5rem',
              borderRadius: 'var(--reefpi-radius-sm)',
              cursor: 'pointer',
              background: theme === opt.value ? 'var(--reefpi-color-pending-bg)' : 'transparent',
              border: theme === opt.value
                ? '1px solid var(--reefpi-color-brand)'
                : '1px solid transparent',
              transition: 'background 0.12s'
            }}
          >
            <input
              type='radio'
              name='reefpi-theme'
              value={opt.value}
              checked={theme === opt.value}
              onChange={() => handleChange(opt.value)}
              style={{ accentColor: 'var(--reefpi-color-brand)', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <span>
              <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--reefpi-color-text)' }}>
                {opt.label}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--reefpi-color-text-muted)', marginLeft: '0.4rem' }}>
                — {opt.desc}
              </span>
            </span>
            {opt.value === theme && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '0.65rem',
                fontFamily: 'var(--reefpi-font-mono)',
                color: 'var(--reefpi-color-brand)',
                background: 'var(--reefpi-color-band-safe)',
                padding: '1px 6px',
                borderRadius: '999px'
              }}>
                active
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

ThemePicker.propTypes = {
  onSessionOverride: PropTypes.func
}
