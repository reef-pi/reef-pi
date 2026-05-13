import React, { useState } from 'react'
import PropTypes from 'prop-types'
import ThresholdGauge from '../primitives/ThresholdGauge'
import Sparkline from '../primitives/Sparkline'
import RangeSelector from '../primitives/RangeSelector'
import { useTimeSeries } from '../hooks/useTimeSeries'

const SAFE  = [76, 80]
const WARN  = [74, 82]
const CRIT  = [70, 86]

function delta (points) {
  if (!points || points.length < 2) return null
  const now = points[points.length - 1].v
  const hour = points[Math.max(0, points.length - Math.ceil(points.length / 24))].v
  return (now - hour).toFixed(1)
}

export default function TemperatureTile ({ metric = 'temperature.display', unit = '°F' }) {
  const [range, setRange]         = useState('1d')
  const [hoverValue, setHoverValue] = useState(null)

  const { points, loading, error, refetch } = useTimeSeries({ metric, range, maxPoints: 120 })

  const latest  = points.length ? points[points.length - 1].v : null
  const display = hoverValue !== null ? hoverValue : latest
  const diff    = delta(points)

  return (
    <div
      className='reefpi-temperature-tile col-md-8'
      style={{
        background: 'var(--reefpi-color-surface-elevated)',
        border: '1px solid var(--reefpi-color-border)',
        borderRadius: 'var(--reefpi-radius-md)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '320px',
        overflow: 'hidden',
        fontFamily: 'var(--reefpi-font-app)'
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--reefpi-color-border)',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--reefpi-color-text-muted)' }}>
          Temperature
        </span>
        <RangeSelector value={range} onChange={setRange} scope='dashboard' compact />
      </div>

      {/* ── Body ── */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.75rem', minHeight: 0 }}>

        {loading && !points.length ? (
          <LoadingSkeleton />
        ) : error && !points.length ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            {/* ThresholdGauge */}
            <ThresholdGauge
              value={display ?? 78}
              safe={SAFE}
              warn={WARN}
              critical={CRIT}
              unit={unit}
              label='Display Tank'
            />

            {/* Numeric readout */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{
                fontSize: '3rem',
                fontWeight: 500,
                lineHeight: 1,
                color: 'var(--reefpi-color-text)',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {display !== null ? display.toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--reefpi-color-text-muted)' }}>{unit}</span>
              {diff !== null && hoverValue === null && (
                <span style={{
                  fontSize: '0.8rem',
                  color: parseFloat(diff) >= 0 ? 'var(--reefpi-color-warn)' : 'var(--reefpi-color-brand)',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {parseFloat(diff) >= 0 ? '+' : ''}{diff} vs 1h ago
                </span>
              )}
              {hoverValue !== null && (
                <span style={{ fontSize: '0.8rem', color: 'var(--reefpi-color-text-muted)' }}>
                  scrubbing history
                </span>
              )}
            </div>

            {/* Sparkline — fills remaining height */}
            <div style={{ flex: '1 1 auto', minHeight: '80px' }}>
              <Sparkline
                points={points}
                fill='gradient'
                band={SAFE}
                bandColor='var(--reefpi-color-band-safe)'
                hover
                onHover={pt => setHoverValue(pt ? pt.v : null)}
                height={120}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton () {
  const bar = h => ({
    height: h,
    borderRadius: 'var(--reefpi-radius-sm)',
    background: 'var(--reefpi-color-surface)',
    animation: 'reefpi-shimmer 1.4s infinite',
    backgroundSize: '200% 100%'
  })
  return (
    <>
      <style>{`@keyframes reefpi-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={bar('14px')} />
      <div style={{ ...bar('3rem'), width: '45%' }} />
      <div style={{ ...bar('120px'), flex: '1 1 auto' }} />
    </>
  )
}

function ErrorState ({ message, onRetry }) {
  return (
    <div style={{
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem'
    }}>
      <div style={{
        padding: '0.5rem 0.75rem',
        background: 'var(--reefpi-color-error-bg)',
        border: '1px solid var(--reefpi-color-error-border)',
        borderRadius: 'var(--reefpi-radius-sm)',
        color: 'var(--reefpi-color-error)',
        fontSize: '0.8rem',
        textAlign: 'center'
      }}>
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: '1px solid var(--reefpi-color-border-strong)',
            borderRadius: 'var(--reefpi-radius-sm)',
            color: 'var(--reefpi-color-text)',
            fontSize: '0.8rem',
            padding: '0 1rem',
            minHeight: '44px',
            cursor: 'pointer',
            fontFamily: 'var(--reefpi-font-app)'
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}

TemperatureTile.propTypes = {
  metric: PropTypes.string,
  unit: PropTypes.string
}
