import React from 'react'
import PropTypes from 'prop-types'

/*
 * States:
 *   off     — grey track, thumb left
 *   on      — brand track, thumb right
 *   pending — thumb centered, spinner ring in --reefpi-color-pending
 *   error   — red ring + retry icon; track stays last-known color
 *
 * Flag: pending_states (E4). Component is exported normally; parent decides
 * whether to render it based on window.FEATURE_FLAGS?.pending_states.
 */

const TRACK_W  = 44
const TRACK_H  = 24
const THUMB_R  = 10  // thumb radius
const CENTER_X = TRACK_W / 2
const CENTER_Y = TRACK_H / 2

function thumbX (state) {
  if (state === 'on')      return TRACK_W - THUMB_R - 2
  if (state === 'off')     return THUMB_R + 2
  return CENTER_X  // pending + error: centered
}

const TRACK_COLOR = {
  on:      'var(--reefpi-color-brand)',
  off:     'var(--reefpi-color-border-strong)',
  pending: null,   // inherits last-known; set by parent via lastKnown
  error:   null
}

export default function ToggleSwitch ({
  state = 'off',
  onRequestChange,
  onRetry,
  errorMessage = ''
}) {
  const isInteractive = state === 'on' || state === 'off'
  const lastKnownTrack = state === 'on' || state === 'pending'
    ? 'var(--reefpi-color-brand)'
    : 'var(--reefpi-color-border-strong)'

  // For pending, keep track at last-known. We approximate by storing it.
  const trackColor = state === 'on'
    ? 'var(--reefpi-color-brand)'
    : state === 'off'
      ? 'var(--reefpi-color-border-strong)'
      : lastKnownTrack

  const tx = thumbX(state)

  const handleClick = () => {
    if (state === 'on')  { onRequestChange?.('off'); return }
    if (state === 'off') { onRequestChange?.('on');  return }
    if (state === 'error' && onRetry) { onRetry(); return }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
      <button
        role='switch'
        aria-checked={state === 'on'}
        aria-label={`Toggle switch — ${state}`}
        onClick={handleClick}
        disabled={state === 'pending'}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: isInteractive || state === 'error' ? 'pointer' : 'default',
          display: 'inline-block',
          lineHeight: 0
        }}
      >
        <svg
          width={TRACK_W}
          height={TRACK_H}
          viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
          overflow='visible'
          aria-hidden='true'
        >
          {/* Track */}
          <rect
            x='0' y='0'
            width={TRACK_W} height={TRACK_H}
            rx={TRACK_H / 2}
            fill={trackColor}
            style={{ transition: 'fill 0.2s' }}
          />

          {/* Thumb */}
          <circle
            cx={tx}
            cy={CENTER_Y}
            r={THUMB_R}
            fill='var(--reefpi-color-surface-elevated)'
            stroke='var(--reefpi-color-border)'
            strokeWidth='1'
            style={{ transition: 'cx 0.2s' }}
          />

          {/* Pending spinner ring */}
          {state === 'pending' && (
            <circle
              cx={tx}
              cy={CENTER_Y}
              r={THUMB_R + 3}
              fill='none'
              stroke='var(--reefpi-color-pending)'
              strokeWidth='2'
              strokeDasharray={`${Math.PI * (THUMB_R + 3) * 0.65} ${Math.PI * (THUMB_R + 3) * 0.35}`}
              style={{
                transformOrigin: `${tx}px ${CENTER_Y}px`,
                animation: 'reefpi-spin 0.9s linear infinite'
              }}
            />
          )}

          {/* Error ring */}
          {state === 'error' && (
            <>
              <circle
                cx={tx}
                cy={CENTER_Y}
                r={THUMB_R + 3}
                fill='none'
                stroke='var(--reefpi-color-error)'
                strokeWidth='2'
              />
              {/* Retry icon: clockwise arrow arc */}
              <path
                d={`M ${tx + THUMB_R + 3} ${CENTER_Y - 2} A ${THUMB_R + 3} ${THUMB_R + 3} 0 0 0 ${tx - (THUMB_R + 3)} ${CENTER_Y - 2}`}
                fill='none'
                stroke='var(--reefpi-color-error)'
                strokeWidth='1.5'
                strokeLinecap='round'
              />
              <polygon
                points={`${tx + THUMB_R + 3} ${CENTER_Y - 2}, ${tx + THUMB_R + 3 + 4} ${CENTER_Y - 5}, ${tx + THUMB_R + 3 + 4} ${CENTER_Y + 1}`}
                fill='var(--reefpi-color-error)'
              />
            </>
          )}
        </svg>
      </button>

      {/* Error message — aria-live so screen readers announce it */}
      {state === 'error' && errorMessage && (
        <span
          aria-live='polite'
          style={{
            fontSize: '0.7rem',
            color: 'var(--reefpi-color-error)',
            fontFamily: 'var(--reefpi-font-app)'
          }}
        >
          {errorMessage}
        </span>
      )}

      <style>{`
        @keyframes reefpi-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  )
}

ToggleSwitch.propTypes = {
  state: PropTypes.oneOf(['off', 'on', 'pending', 'error']),
  onRequestChange: PropTypes.func,
  onRetry: PropTypes.func,
  errorMessage: PropTypes.string
}
