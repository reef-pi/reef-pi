import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const DEFAULT_OPTIONS = ['1h', '6h', '1d', '7d', '30d']

function storageKey (scope) {
  return `reefpi.range.${scope || 'global'}`
}

function compactLabel (opt) {
  return opt.replace(/[a-z]/g, '')
}

export default function RangeSelector ({
  value: valueProp,
  options = DEFAULT_OPTIONS,
  onChange,
  compact = false,
  scope = 'global'
}) {
  const [value, setValue] = useState(() => {
    if (valueProp !== undefined) return valueProp
    try { return localStorage.getItem(storageKey(scope)) || options[0] } catch { return options[0] }
  })

  // Sync when controlled prop changes
  useEffect(() => {
    if (valueProp !== undefined) setValue(valueProp)
  }, [valueProp])

  const debounceRef = useRef(null)

  const handleChange = useCallback(opt => {
    setValue(opt)
    if (onChange) onChange(opt)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      try { localStorage.setItem(storageKey(scope), opt) } catch { /* storage unavailable */ }
    }, 250)
  }, [onChange, scope])

  const name = `reefpi-range-${scope}`

  return (
    <fieldset
      className='reefpi-range-selector'
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        borderRadius: 'var(--reefpi-radius-sm)',
        border: '1px solid var(--reefpi-color-border)',
        overflow: 'hidden',
        background: 'var(--reefpi-color-surface-elevated)'
      }}
    >
      <legend style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        Time range
      </legend>

      {options.map((opt, i) => {
        const id = `${name}-${opt}`
        const selected = opt === value
        const label = compact ? compactLabel(opt) : opt.toUpperCase()

        return (
          <React.Fragment key={opt}>
            {i > 0 && (
              <span aria-hidden='true' style={{
                width: '1px',
                background: 'var(--reefpi-color-border)',
                flexShrink: 0
              }} />
            )}
            <label
              htmlFor={id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                minHeight: '32px',
                padding: '0 0.5rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'var(--reefpi-font-app)',
                fontWeight: selected ? 500 : 400,
                background: selected ? 'var(--reefpi-color-brand)' : 'transparent',
                color: selected ? 'var(--reefpi-color-nav-text-strong)' : 'var(--reefpi-color-text)',
                transition: 'background-color 0.12s, color 0.12s',
                userSelect: 'none'
              }}
            >
              <input
                type='radio'
                id={id}
                name={name}
                value={opt}
                checked={selected}
                onChange={() => handleChange(opt)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              {label}
            </label>
          </React.Fragment>
        )
      })}
    </fieldset>
  )
}

RangeSelector.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  compact: PropTypes.bool,
  scope: PropTypes.string
}
