import React from 'react'
import PropTypes from 'prop-types'
import MetricTile from './MetricTile'

export default function AtoTile ({ globalRange, targetLevel, alert, onAlertClick }) {
  // band only shown when a target is configured
  const band = targetLevel != null ? [targetLevel * 0.95, targetLevel * 1.05] : undefined

  return (
    <MetricTile
      metric='ato.reservoir'
      label='ATO'
      unit='%'
      band={band}
      globalRange={globalRange}
      formatValue={v => v.toFixed(0)}
      trendPrecision={1}
      alert={alert}
      onAlertClick={onAlertClick}
    >
      {({ value }) => value !== null && (
        <span style={{
          fontSize: '0.65rem',
          fontFamily: 'var(--reefpi-font-mono)',
          color: value < 20
            ? 'var(--reefpi-color-warn)'
            : 'var(--reefpi-color-text-muted)'
        }}
        >
          {value < 20 ? 'low — refill soon' : 'reservoir OK'}
        </span>
      )}
    </MetricTile>
  )
}

AtoTile.propTypes = {
  globalRange: PropTypes.string,
  targetLevel: PropTypes.number,
  alert: PropTypes.shape({ severity: PropTypes.string, message: PropTypes.string, at: PropTypes.number }),
  onAlertClick: PropTypes.func
}
