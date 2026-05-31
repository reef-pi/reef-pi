import React from 'react'
import PropTypes from 'prop-types'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const pctOf = (value, min, max) => ((value - min) / (max - min)) * 100
const pct = value => Math.round(value * 1000) / 1000

const isRange = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite)

function normaliseRange (range) {
  if (!isRange(range)) return null
  return range[0] <= range[1] ? range : [range[1], range[0]]
}

function addZone (zones, min, max, start, end, color) {
  const left = pct(clamp(pctOf(start, min, max), 0, 100))
  const right = pct(clamp(pctOf(end, min, max), 0, 100))
  if (right <= left) return
  zones.push({ left, width: pct(right - left), color })
}

function buildZones (min, max, safe, warn) {
  if (max <= min) return [{ left: 0, width: 100, color: 'var(--reefpi-color-band-safe)' }]

  const safeRange = normaliseRange(safe)
  const warnRange = normaliseRange(warn)
  const zones = []

  if (safeRange) {
    const outer = warnRange || safeRange
    addZone(zones, min, max, min, outer[0], 'var(--reefpi-color-band-critical)')
    if (warnRange) addZone(zones, min, max, warnRange[0], safeRange[0], 'var(--reefpi-color-band-warn)')
    addZone(zones, min, max, safeRange[0], safeRange[1], 'var(--reefpi-color-band-safe)')
    if (warnRange) addZone(zones, min, max, safeRange[1], warnRange[1], 'var(--reefpi-color-band-warn)')
    addZone(zones, min, max, outer[1], max, 'var(--reefpi-color-band-critical)')
    return zones
  }

  if (warnRange) {
    addZone(zones, min, max, min, warnRange[0], 'var(--reefpi-color-band-critical)')
    addZone(zones, min, max, warnRange[0], warnRange[1], 'var(--reefpi-color-band-safe)')
    addZone(zones, min, max, warnRange[1], max, 'var(--reefpi-color-band-critical)')
    return zones
  }

  return [{ left: 0, width: 100, color: 'var(--reefpi-color-band-safe)' }]
}

function zoneLabel (value, safe, warn, min, max) {
  const safeRange = normaliseRange(safe)
  const warnRange = normaliseRange(warn)

  if (value < min || value > max) return 'out of bounds'
  if (safeRange && value >= safeRange[0] && value <= safeRange[1]) return 'within safe range'
  if (!safeRange && warnRange && value >= warnRange[0] && value <= warnRange[1]) return 'within safe range'
  if (warnRange && value >= warnRange[0] && value <= warnRange[1]) return 'in warning zone'
  if (!safeRange && !warnRange) return 'within safe range'
  return 'out of bounds'
}

function formatValue (value, unit) {
  return String(value) + unit
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
  const safeRange = normaliseRange(safe)
  const warnRange = normaliseRange(warn)
  const criticalRange = normaliseRange(critical)
  const min = criticalRange ? criticalRange[0] : (warnRange ? warnRange[0] : (safeRange ? safeRange[0] : 0))
  const max = criticalRange ? criticalRange[1] : (warnRange ? warnRange[1] : (safeRange ? safeRange[1] : 100))
  const rangeMax = max > min ? max : min + 1
  const clampedValue = clamp(value, min, rangeMax)
  const indicatorPct = pct(pctOf(clampedValue, min, rangeMax))
  const outOfBounds = value < min || value > rangeMax
  const status = zoneLabel(value, safeRange, warnRange, min, rangeMax)
  const inWarn = status === 'in warning zone'
  const zones = buildZones(min, rangeMax, safeRange, warnRange)
  const indicatorColor = outOfBounds
    ? 'var(--reefpi-color-band-critical)'
    : 'var(--reefpi-color-text-strong)'
  const valueText = formatValue(value, unit) + ', ' + status

  React.useEffect(() => {
    if (outOfBounds && onBoundsExceeded) onBoundsExceeded(value)
  }, [value, outOfBounds, onBoundsExceeded])

  return (
    <div className='reefpi-threshold-gauge' style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--reefpi-color-text-muted)' }}>{label}</span>
      </div>

      <div
        role='meter'
        aria-label={label || 'Threshold gauge'}
        aria-valuemin={min}
        aria-valuemax={rangeMax}
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
        <span
          className='reefpi-threshold-gauge__value'
          style={{
            position: 'absolute',
            left: indicatorPct + '%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: outOfBounds
              ? 'var(--reefpi-color-error)'
              : inWarn
                ? 'var(--reefpi-color-warn)'
                : 'var(--reefpi-color-text)',
            whiteSpace: 'nowrap'
          }}
        >
          {value}{unit && <sub style={{ fontSize: '0.65em', lineHeight: 0 }}>{unit}</sub>}
        </span>

        <div style={{ position: 'absolute', inset: 0, borderRadius: '7px', overflow: 'hidden' }}>
          {zones.map((z, i) => (
            <div
              key={i} style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: z.left + '%',
                width: z.width + '%',
                background: z.color
              }}
            />
          ))}
        </div>

        <div style={{
          position: 'absolute',
          top: '50%',
          left: indicatorPct + '%',
          transform: 'translate(-50%, -50%)',
          width: '2px',
          height: '20px',
          background: indicatorColor,
          borderRadius: '1px',
          zIndex: 1
        }}
        />

        <div style={{
          position: 'absolute',
          top: '50%',
          left: indicatorPct + '%',
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: 'var(--reefpi-color-surface-elevated)',
          border: '2px solid ' + indicatorColor,
          zIndex: 2
        }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)' }}>
          {formatValue(min, unit)}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--reefpi-color-text-muted)', fontFamily: 'var(--reefpi-font-mono)' }}>
          {formatValue(rangeMax, unit)}
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
