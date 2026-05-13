import React from 'react'
import PropTypes from 'prop-types'
import MetricTile from './MetricTile'

const PH_BAND = [8.1, 8.4]

export default function PhTile ({ globalRange }) {
  return (
    <MetricTile
      metric='ph.display'
      label='pH'
      unit=''
      band={PH_BAND}
      globalRange={globalRange}
      formatValue={v => v.toFixed(2)}
      trendPrecision={2}
    >
      {({ value }) => value !== null && (
        <span style={{
          fontSize: '0.65rem',
          fontFamily: 'var(--reefpi-font-mono)',
          color: value >= PH_BAND[0] && value <= PH_BAND[1]
            ? 'var(--reefpi-color-brand)'
            : 'var(--reefpi-color-warn)'
        }}>
          {value >= PH_BAND[0] && value <= PH_BAND[1] ? 'within safe range' : 'outside safe range'}
        </span>
      )}
    </MetricTile>
  )
}

PhTile.propTypes = { globalRange: PropTypes.string }
