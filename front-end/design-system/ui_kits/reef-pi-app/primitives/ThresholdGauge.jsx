import React from 'react'
import PropTypes from 'prop-types'

/**
 * Builds percentage-based colour zones along a 0–100 track.
 * Returns an array of { left, width, color } objects ready for inline styles.
 */
function buildZones (min, max, safe, warn) {
  const pct = v => ((v - min) / (max - min)) * 100

  if (!safe && !warn) {
    return [{ left: 0, width: 100, color: 'var(--reefpi-color-band-safe)' }]
  }

  const zones = []

  if (warn) {
    // critical (red) left of warn
    if (warn[0] > min) {
      zones.push({ left: 0, width: pct(warn[0]), color: 'var(--reefpi-color-band-critical)' })
    }
    // warn (yellow) left of safe
    if (safe && safe[0] > warn[0]) {
      zones.push({ left: pct(warn[0]), width: pct(safe[0]) - pct(warn[0]), color: 'var(--reefpi-color-band-warn)' })
    }
  } else if (safe) {
    // no warn band — left of safe is critical
    if (safe[0] > min) {
      zones.push({ left: 0, width: pct(safe[0]), color: 'var(--reefpi-color-band-critical)' })
    }
  }

  // safe (green) band
  if (safe) {
    zones.push({ left: pct(safe[0]), width: pct(safe[1]) - pct(safe[0]), color: 'var(--reefpi-color-band-safe)' })
  }

  if (warn) {
    // warn (yellow) right of safe
    if (safe && warn[1] > safe[1]) {
      zones.push({ left: pct(safe[1]), width: pct(warn[1]) - pct(safe[1]), color: 'var(--reefpi-color-band-warn)' })
    }
    // critical (red) right of warn
    if (warn[1] < max) {
      zones.push({ left: pct(warn[1]), width: 100 - pct(warn[1]), color: 'var(--reefpi-color-band-critical)' })
    }
  } else if (safe) {
    // no warn band — right of safe is critical
    if (safe[1] < max) {
      zones.push({ left: pct(safe[1]), width: 100 - pct(safe[1]), color: 'var(--reefpi-color-band-critical)' })
    }
  }

  return zones
}

function zoneLabel (value, safe, warn) {
  if (safe && value >= safe[0] && value <= safe[1]) return 'within safe range'
  if (warn && value >= warn[0] && value <= warn[1]) return 'in warning zone'
  return 'out of bounds'
}

export default function ThresholdGauge ({
  value,
  safe,
  warn,
  critical,
  unit = '',
  label = '',
  onBoundsExceeded
}) {
  const min = critical ? critical[0] : (warn ? warn[0] : (safe ? safe[0] : 0))
  const max = critical ? critical[1] : (warn ? warn[1] : (safe ? safe[1] : 100))

  const clampedValue = Math.min(Math.max(value, min), max)
  const indicatorPct = ((clampedValue - min) / (max - min)) * 100

  const outOfBounds = value < min || value > max
  const inWarn = !outOfBounds && warn && (value < (safe ? safe[0] : warn[0]) || value > (safe ? safe[1] : warn[1]))

  React.useEffect(() => {
    if (outOfBounds && onBoundsExceeded) onBoundsExceeded(value)
  }, [value, outOfBounds, onBoundsExceeded])

  const zones = buildZones(min, max, safe || null, warn || null)

  const indicatorColor = outOfBounds
    ? 'var(--reefpi-color-band-critical)'
    : 'var(--reefpi-color-text-strong)'

  const valueText = `${value}${unit}, ${zoneLabel(value, safe, warn)}`

  return (
    <div className='reefpi-threshold-gauge' style={{ width: '100%' }}>
      {/* Value + label row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '6px'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: outOfBounds
            ? 'var(--reefpi-color-error)'
            : inWarn
              ? 'var(--reefpi-color-warn)'
              : 'var(--reefpi-color-text)'
        }}>
          {value}{unit}
        </span>
        {label && (
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--reefpi-color-text-muted)'
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Track */}
      <div
        role='meter'
        aria-label={label || 'Threshold gauge'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        style={{
          position: 'relative',
          height: '14px',
          borderRadius: '7px',
          overflow: 'visible',
          background: 'var(--reefpi-color-surface-elevated)',
          border: '1px solid var(--reefpi-color-border)'
        }}
      >
        {/* Coloured zone segments */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '7px', overflow: 'hidden' }}>
          {zones.map((z, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${z.left}%`,
              width: `${z.width}%`,
              background: z.color
            }} />
          ))}
        </div>

        {/* Needle drop */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${indicatorPct}%`,
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '20px',
          background: indicatorColor,
          borderRadius: '1px',
          zIndex: 1
        }} />

        {/* Circular indicator */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${indicatorPct}%`,
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'var(--reefpi-color-surface-elevated)',
          border: `2px solid ${indicatorColor}`,
          zIndex: 2
        }} />
      </div>

      {/* Min / max labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '4px'
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)' }}>
          {min}{unit}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)' }}>
          {max}{unit}
        </span>
      </div>
    </div>
  )
}

ThresholdGauge.propTypes = {
  value: PropTypes.number.isRequired,
  safe: PropTypes.arrayOf(PropTypes.number),
  warn: PropTypes.arrayOf(PropTypes.number),
  critical: PropTypes.arrayOf(PropTypes.number),
  unit: PropTypes.string,
  label: PropTypes.string,
  onBoundsExceeded: PropTypes.func
}
