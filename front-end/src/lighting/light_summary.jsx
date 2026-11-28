import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'utils/i18n'
import ControllerSummary from '../ui_components/controller_summary'

const notConfigured = () => i18n.t('not_configured', { defaultValue: 'Not configured' })

const nameOf = (id, items = []) => {
  if (id === undefined || id === null || id === '') return notConfigured()
  return items.find(item => item.id === id)?.name || id
}

const present = value => value !== undefined && value !== null && value !== ''

const profileLabel = type => {
  if (!type) return notConfigured()
  const fallback = `${type.charAt(0).toUpperCase()}${type.slice(1)}`
  return i18n.t(`lighting:profile_${type}`, { defaultValue: fallback })
}

const modeLabel = mode => {
  if (!mode) return notConfigured()
  const fallback = `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`
  return i18n.t(`lighting:mode_${mode}`, { defaultValue: fallback })
}

const channelPin = ([key, channel = {}]) => present(channel.pin) ? channel.pin : key

const compareChannels = (left, right) => {
  const leftPin = Number(channelPin(left))
  const rightPin = Number(channelPin(right))
  if (!Number.isNaN(leftPin) && !Number.isNaN(rightPin)) return leftPin - rightPin
  return String(channelPin(left)).localeCompare(String(channelPin(right)))
}

export default function LightSummary ({ light, jacks, mode, children }) {
  const channels = Object.entries(light.channels || {}).sort(compareChannels)
  const channelItems = channels.length
    ? channels.map(([key, channel = {}], index) => {
      const pin = channelPin([key, channel])
      const name = channel.name || `${i18n.t('lighting:channel', { defaultValue: 'Light channel' })} ${index + 1}`
      const values = [profileLabel(channel.profile?.type)]
      if (present(channel.value)) values.push(`${i18n.t('lighting:current_intensity', { defaultValue: 'Current' })} ${channel.value}%`)
      const configured = channel.profile?.type === 'fixed' ? channel.profile?.config?.value : undefined
      if (present(configured)) values.push(`${i18n.t('lighting:configured_intensity', { defaultValue: 'Configured' })} ${configured}%`)
      return {
        label: `${name} · ${i18n.t('lighting:pin', { defaultValue: 'Pin' })} ${pin}`,
        value: values.join(' · ')
      }
    })
    : [{ label: i18n.t('lighting:channels_summary', { defaultValue: 'Channels' }), value: i18n.t('none', { defaultValue: 'None' }) }]

  return (
    <>
      <ControllerSummary
        sections={[
          {
            title: i18n.t('lighting:fixture_summary', { defaultValue: 'Fixture' }),
            items: [
              { label: i18n.t('lighting:jack', { defaultValue: 'Jack' }), value: nameOf(light.jack, jacks) },
              { label: i18n.t('lighting:control_mode', { defaultValue: 'Control mode' }), value: modeLabel(mode) }
            ]
          },
          {
            title: i18n.t('lighting:channels_summary', { defaultValue: 'Channels' }),
            items: channelItems
          }
        ]}
      />
      {children}
    </>
  )
}

LightSummary.propTypes = {
  light: PropTypes.object.isRequired,
  jacks: PropTypes.array,
  mode: PropTypes.oneOf(['auto', 'manual', 'mixed']).isRequired,
  children: PropTypes.node
}
