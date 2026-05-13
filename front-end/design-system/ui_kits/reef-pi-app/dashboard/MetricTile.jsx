import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Sparkline from '../primitives/Sparkline'
import RangeSelector from '../primitives/RangeSelector'
import { useTimeSeries } from '../hooks/useTimeSeries'

/**
 * Shared col-md-4 tile shell used by PhTile and AtoTile.
 * Handles fetch, loading/error/empty states, and the compact header layout.
 * Children receive { value, points, hoverValue } for custom rendering.
 */
export default function MetricTile ({
  metric,
  label,
  unit = '',
  band,
  globalRange,       // lifted range from parent (optional)
  defaultRange = '1d',
  formatValue = v => v.toFixed(2),
  trendPrecision = 2,
  children
}) {
  const [localRange, setLocalRange] = useState(null)
  const [hoverValue, setHoverValue] = useState(null)

  // Local range overrides global; falls back to global then default
  const range = localRange ?? globalRange ?? defaultRange

  const { points, loading, error, refetch } = useTimeSeries({
    metric,
    range,
    maxPoints: 80
  })

  const latest = points.length ? points[points.length - 1].v : null

  // Trend: compare last point vs point ~25% earlier
  const trendBase = points.length > 4 ? points[Math.floor(points.length * 0.75)].v : null
  const trend = latest !== null && trendBase !== null
    ? (latest - trendBase).toFixed(trendPrecision)
    : null

  const displayValue = hoverValue !== null ? hoverValue : latest

  return (
    <div
      className='reefpi-metric-tile col-md-4'
      style={{
        background: 'var(--reefpi-color-surface-elevated)',
        border: '1px solid var(--reefpi-color-border)',
        borderRadius: 'var(--reefpi-radius-md)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '220px',
        overflow: 'hidden',
        fontFamily: 'var(--reefpi-font-app)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 0.875rem',
        borderBottom: '1px solid var(--reefpi-color-border)',
        flexShrink: 0
      }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--reefpi-color-text-muted)'
        }}>
          {label}
        </span>
        <RangeSelector
          value={range}
          onChange={r => setLocalRange(r)}
          scope={metric}
          compact
        />
      </div>

      {/* Body */}
      <div style={{
        flex: '1 1 auto', display: 'flex', flexDirection: 'column',
        padding: '0.75rem 0.875rem', gap: '0.5rem', minHeight: 0
      }}>
        {loading && !points.length ? (
          <TileSkeleton />
        ) : error && !points.length ? (
          <TileError message={error} onRetry={refetch} />
        ) : !points.length ? (
          <TileEmpty label={label} />
        ) : (
          <>
            {/* Value row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
              <span style={{
                fontSize: '1.75rem', fontWeight: 500, lineHeight: 1,
                color: 'var(--reefpi-color-text)', fontVariantNumeric: 'tabular-nums'
              }}>
                {displayValue !== null ? formatValue(displayValue) : '—'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--reefpi-color-text-muted)' }}>
                {unit}
              </span>
              {trend !== null && hoverValue === null && (
                <TrendArrow trend={parseFloat(trend)} precision={trendPrecision} />
              )}
            </div>

            {/* Custom slot (e.g. sub-label from PhTile/AtoTile) */}
            {children?.({ value: displayValue, points, hoverValue })}

            {/* Sparkline */}
            <div style={{ flex: '1 1 auto', minHeight: '60px' }}>
              <Sparkline
                points={points}
                fill='gradient'
                band={band}
                bandColor='var(--reefpi-color-band-safe)'
                hover
                onHover={pt => setHoverValue(pt ? pt.v : null)}
                height={80}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TrendArrow ({ trend, precision }) {
  const up = trend >= 0
  return (
    <span style={{
      fontSize: '0.72rem',
      color: up ? 'var(--reefpi-color-warn)' : 'var(--reefpi-color-brand)',
      display: 'inline-flex', alignItems: 'center', gap: '1px',
      fontVariantNumeric: 'tabular-nums'
    }}>
      {up ? '▲' : '▼'} {Math.abs(trend).toFixed(precision)}
    </span>
  )
}

function TileSkeleton () {
  const bar = (h, w = '100%') => ({
    height: h, width: w, borderRadius: 'var(--reefpi-radius-sm)',
    background: 'linear-gradient(90deg,var(--reefpi-color-surface) 25%,var(--reefpi-color-border) 50%,var(--reefpi-color-surface) 75%)',
    backgroundSize: '200% 100%', animation: 'reefpi-shimmer 1.4s infinite'
  })
  return (
    <>
      <style>{`@keyframes reefpi-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={bar('1.75rem', '50%')} />
      <div style={{ ...bar('80px'), flex: '1 1 auto' }} />
    </>
  )
}

function TileError ({ message, onRetry }) {
  return (
    <div style={{
      flex: '1 1 auto', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
    }}>
      <span style={{
        fontSize: '0.75rem', color: 'var(--reefpi-color-error)',
        background: 'var(--reefpi-color-error-bg)',
        border: '1px solid var(--reefpi-color-error-border)',
        borderRadius: 'var(--reefpi-radius-sm)',
        padding: '0.4rem 0.75rem'
      }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: 'none', border: '1px solid var(--reefpi-color-border-strong)',
          borderRadius: 'var(--reefpi-radius-sm)', color: 'var(--reefpi-color-text)',
          fontSize: '0.75rem', padding: '0 0.75rem', minHeight: '44px',
          cursor: 'pointer', fontFamily: 'var(--reefpi-font-app)'
        }}>Retry</button>
      )}
    </div>
  )
}

function TileEmpty ({ label }) {
  return (
    <div style={{
      flex: '1 1 auto', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--reefpi-color-text-muted)',
      fontSize: '0.8rem'
    }}>
      No {label} data yet
    </div>
  )
}

MetricTile.propTypes = {
  metric: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  unit: PropTypes.string,
  band: PropTypes.arrayOf(PropTypes.number),
  globalRange: PropTypes.string,
  defaultRange: PropTypes.string,
  formatValue: PropTypes.func,
  trendPrecision: PropTypes.number,
  children: PropTypes.func
}
