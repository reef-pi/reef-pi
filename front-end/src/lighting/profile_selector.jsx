import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'utils/i18n'

const PROFILE_OPTIONS = [
  { value: 'fixed', label: 'Fixed', translationKey: 'lighting:profile_fixed' },
  { value: 'interval', label: 'Interval', translationKey: 'lighting:profile_interval' },
  { value: 'diurnal', label: 'Diurnal', translationKey: 'lighting:profile_diurnal' },
  { value: 'random', label: 'Random', translationKey: 'lighting:profile_random' },
  { value: 'sine', label: 'Sine', translationKey: 'lighting:profile_sine' },
  { value: 'lunar', label: 'Lunar', translationKey: 'lighting:profile_lunar' },
  { value: 'circadian', label: 'Circadian', translationKey: 'lighting:profile_circadian' },
  { value: 'cyclic', label: 'Cyclic', translationKey: 'lighting:profile_cyclic' },
  { value: 'lightning', label: 'Lightning', translationKey: 'lighting:profile_lightning' },
  { value: 'solar', label: 'Solar', translationKey: 'lighting:profile_solar' }
]

const PROFILE_HELP = {
  fixed: 'Hold one intensity during the configured time range.',
  interval: 'Interpolate evenly between exact intensity points across the configured time range.',
  diurnal: 'Ramp intensity up and down across a daylight window.',
  random: 'Vary intensity randomly during the configured time range.',
  sine: 'Follow a smooth sine wave during the configured time range.',
  lunar: 'Follow the lunar cycle from a known full-moon date.',
  circadian: 'Blend dawn and noon intensities across a daily cycle.',
  cyclic: 'Repeat a cycle using its period and phase shift.',
  lightning: 'Generate configured lightning flashes during a time range.',
  solar: 'Follow solar timing for the configured latitude and longitude.'
}

const ProfileSelector = (props) => {
  const id = props.id || `${props.name.replace(/[^a-zA-Z0-9_-]/g, '-')}-type`
  const helpId = `${id}-help`

  const handleChange = event => {
    event.target.name = props.name
    props.onChangeHandler(event)
  }

  return (
    <div className='reefpi-lighting-profile-selector'>
      <select
        id={id}
        name={props.name}
        value={props.value}
        onChange={handleChange}
        disabled={props.readOnly}
        className={props.className}
        aria-label={i18next.exists('profile') ? i18next.t('profile') : 'Profile'}
        aria-describedby={helpId}
        data-testid='lighting-profile-selector'
      >
        {PROFILE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {i18next.t(option.translationKey, { defaultValue: option.label })}
          </option>
        ))}
      </select>
      <p id={helpId} className='reefpi-lighting-profile-selector__help'>
        {i18next.t(`lighting:profile_help_${props.value}`, { defaultValue: PROFILE_HELP[props.value] || '' })}
      </p>
    </div>
  )
}

ProfileSelector.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  readOnly: PropTypes.bool
}

export { PROFILE_OPTIONS }
export default ProfileSelector
