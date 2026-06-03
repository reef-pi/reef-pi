import React from 'react'
import PropTypes from 'prop-types'

const radioLabelStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--reefpi-space-xs)',
  padding: '0 var(--reefpi-space-sm)',
  minHeight: 'var(--reefpi-tap-target-min)',
  background: 'var(--reefpi-color-surface-elevated)',
  border: '1px solid var(--reefpi-color-border)',
  borderRadius: 0,
  color: 'var(--reefpi-color-text)',
  cursor: 'pointer',
  fontFamily: 'var(--reefpi-font-app)',
  fontSize: '0.9375rem',
  fontWeight: 600,
  userSelect: 'none'
}

const ProfileSelector = (props) => {
  const uuid = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)

  const handleChange = e => {
    e.target.name = props.name
    props.onChangeHandler(e)
  }

  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap' }}>
      <div style={{ display: 'none' }}>
        <select
          name={props.name + uuid}
          value={props.value}
          onChange={handleChange}
        >
          <option value='fixed'>Fixed</option>
          <option value='auto'>Interval</option>
          <option value='diurnal'>Diurnal</option>
          <option value='random'>Random</option>
          <option value='sine'>Sine</option>
          <option value='lunar'>Lunar</option>
          <option value='circadian'>Circadian</option>
          <option value='cyclic'>Cyclic</option>
          <option value='lightning'>Lightning</option>
          <option value='solar'>Solar</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {[
          { value: 'fixed', label: 'Fixed' },
          { value: 'interval', label: 'Interval' },
          { value: 'diurnal', label: 'Diurnal' },
          { value: 'random', label: 'Random' },
          { value: 'sine', label: 'Sine' },
          { value: 'lunar', label: 'Lunar' },
          { value: 'circadian', label: 'Circadian' },
          { value: 'cyclic', label: 'Cyclic' },
          { value: 'lightning', label: 'Lightning' },
          { value: 'solar', label: 'Solar' }
        ].map(opt => (
          <label
            key={opt.value}
            style={{
              ...radioLabelStyle,
              background: props.value === opt.value ? 'var(--reefpi-color-brand)' : 'var(--reefpi-color-surface-elevated)',
              borderColor: props.value === opt.value ? 'var(--reefpi-color-brand)' : 'var(--reefpi-color-border)',
              color: props.value === opt.value ? 'var(--reefpi-color-nav-text-strong)' : 'var(--reefpi-color-text)'
            }}
          >
            <input
              type='radio'
              value={opt.value}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              checked={props.value === opt.value}
              name={props.name + uuid}
              id={props.name + uuid + '-' + opt.value}
              onChange={handleChange}
              disabled={props.readOnly}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

ProfileSelector.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChangeHandler: PropTypes.func
}

export default ProfileSelector
